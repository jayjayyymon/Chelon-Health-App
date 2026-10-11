import AsyncStorage from '@react-native-async-storage/async-storage';

export type Appointment = {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  /** Scheduled local datetime in ISO format; legacy records may omit it. */
  scheduledAt?: string;
  /** Unix timestamp when the appointment was booked. */
  timestamp: number;
};

const STORAGE_KEY = '@healthapp_appointments';

export class AppointmentConflictError extends Error {
  constructor() {
    super('This doctor is already booked for the selected date and time.');
    this.name = 'AppointmentConflictError';
  }
}

let operationQueue = Promise.resolve();

const enqueue = <T,>(operation: () => Promise<T>): Promise<T> => {
  const result = operationQueue.then(operation);
  operationQueue = result.then(() => undefined, () => undefined);
  return result;
};

const isValidScheduledAt = (value: unknown): value is string => (
  typeof value === 'string' && !Number.isNaN(new Date(value).getTime())
);

const normalizeAppointment = (value: unknown): Appointment | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const appointment = value as Partial<Appointment>;
  if (
    typeof appointment.id !== 'string'
    || typeof appointment.doctorId !== 'string'
    || typeof appointment.doctorName !== 'string'
    || typeof appointment.specialty !== 'string'
    || typeof appointment.date !== 'string'
    || typeof appointment.time !== 'string'
    || typeof appointment.timestamp !== 'number'
    || !Number.isFinite(appointment.timestamp)
  ) return null;

  const legacyScheduledAt = new Date(`${appointment.date} ${appointment.time}`);
  const scheduledAt = isValidScheduledAt(appointment.scheduledAt)
    ? appointment.scheduledAt
    : Number.isNaN(legacyScheduledAt.getTime()) ? undefined : legacyScheduledAt.toISOString();

  return {
    id: appointment.id,
    doctorId: appointment.doctorId,
    doctorName: appointment.doctorName,
    specialty: appointment.specialty,
    date: appointment.date,
    time: appointment.time,
    scheduledAt,
    timestamp: appointment.timestamp,
  };
};

const readAppointments = async (): Promise<Appointment[]> => {
  try {
    const appointmentsJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (appointmentsJson === null) return [];

    const parsed: unknown = JSON.parse(appointmentsJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeAppointment).filter((item): item is Appointment => item !== null);
  } catch (error) {
    console.error('Failed to get appointments:', error);
    return [];
  }
};

/** Save an appointment and reject an exact doctor/date/time conflict. */
export const saveAppointment = async (
  appointment: Omit<Appointment, 'id' | 'timestamp'>,
): Promise<Appointment> => enqueue(async () => {
  const existingAppointments = await readAppointments();
  if (
    appointment.scheduledAt
    && existingAppointments.some(existing => (
      existing.doctorId === appointment.doctorId
      && existing.scheduledAt === appointment.scheduledAt
    ))
  ) {
    throw new AppointmentConflictError();
  }

  const newAppointment: Appointment = {
    ...appointment,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...existingAppointments, newAppointment]));
  return newAppointment;
});

export const getAppointments = (): Promise<Appointment[]> => enqueue(readAppointments);

export const removeAppointment = (id: string): Promise<void> => enqueue(async () => {
  const existingAppointments = await readAppointments();
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(existingAppointments.filter(appointment => appointment.id !== id)),
  );
});

export const clearAppointments = (): Promise<void> => enqueue(async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
});
