import { getDatabase } from './database';

export type Appointment = {
  id: string;
  account_id: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  scheduled_at?: string; // ISO timestamp
  timestamp: number; // Unix timestamp when booked
};

export type AppointmentInput = Omit<Appointment, 'id' | 'account_id' | 'timestamp'>;

/**
 * Save an appointment
 */
export const saveAppointment = async (
  accountId: string,
  appointmentInput: AppointmentInput
): Promise<Appointment> => {
  const db = getDatabase();

  // Check for conflicts (same doctor, date, and time)
  if (appointmentInput.scheduled_at) {
    const conflict = await db.getFirstAsync<{ id: string }>(`
      SELECT id FROM appointments
      WHERE account_id = ?
        AND doctor_id = ?
        AND scheduled_at = ?
    `, [
      accountId,
      appointmentInput.doctor_id,
      appointmentInput.scheduled_at
    ]);

    if (conflict) {
      throw new Error('This doctor is already booked for the selected date and time.');
    }
  }

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const timestamp = Date.now();

  await db.runAsync(`
    INSERT INTO appointments (
      id, account_id, doctor_id, doctor_name, specialty,
      date, time, scheduled_at, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    accountId,
    appointmentInput.doctor_id,
    appointmentInput.doctor_name,
    appointmentInput.specialty,
    appointmentInput.date,
    appointmentInput.time,
    appointmentInput.scheduled_at ?? null,
    timestamp
  ]);

  // Return the created appointment
  const appointment = await db.getFirstAsync<Appointment>(
    'SELECT * FROM appointments WHERE id = ?',
    [id]
  );

  if (!appointment) {
    throw new Error('Failed to retrieve created appointment');
  }

  return appointment;
};

/**
 * Get appointments for an account
 */
export const getAppointments = async (
  accountId: string,
  upcomingOnly = true
): Promise<Appointment[]> => {
  const db = getDatabase();

  let query = `
    SELECT * FROM appointments
    WHERE account_id = ?
  `;

  const params: any[] = [accountId];

  if (upcomingOnly) {
    query += ` AND (scheduled_at IS NULL OR scheduled_at > ?)`;
    params.push(new Date().toISOString());
  }

  query += ` ORDER BY
    CASE WHEN scheduled_at IS NOT NULL THEN scheduled_at
         ELSE datetime(date || ' ' || time)
    END ASC`;

  const appointments = await db.getAllAsync<Appointment>(query, params);
  return appointments;
};

/**
 * Remove an appointment
 */
export const removeAppointment = async (
  accountId: string,
  appointmentId: string
): Promise<void> => {
  const db = getDatabase();

  await db.runAsync(`
    DELETE FROM appointments
    WHERE account_id = ? AND id = ?
  `, [accountId, appointmentId]);
};