import AsyncStorage from '@react-native-async-storage/async-storage';

export type Appointment = {
  id: string; // booking identifier (timestamp or UUID)
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string; // formatted date string (e.g., "Oct 9, 2026")
  time: string; // time string (e.g., "10:30 AM")
  timestamp: number; // Unix timestamp when booked
};

const STORAGE_KEY = '@healthapp_appointments';

/**
 * Save an appointment to local storage
 */
export const saveAppointment = async (appointment: Omit<Appointment, 'id' | 'timestamp'>) => {
  try {
    const id = Date.now().toString(); // Simple unique ID
    const timestamp = Date.now();
    const newAppointment = { ...appointment, id, timestamp };

    // Get existing appointments
    const existingAppointments = await getAppointments();

    // Add new appointment
    const updatedAppointments = [...existingAppointments, newAppointment];

    // Save back to storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAppointments));

    return newAppointment;
  } catch (error) {
    console.error('Failed to save appointment:', error);
    throw error;
  }
};

/**
 * Get all appointments from local storage
 */
export const getAppointments = async (): Promise<Appointment[]> => {
  try {
    const appointmentsJson = await AsyncStorage.getItem(STORAGE_KEY);
    if (appointmentsJson !== null) {
      return JSON.parse(appointmentsJson);
    }
    return [];
  } catch (error) {
    console.error('Failed to get appointments:', error);
    return [];
  }
};

/**
 * Remove an appointment by ID
 */
export const removeAppointment = async (id: string) => {
  try {
    const existingAppointments = await getAppointments();
    const filteredAppointments = existingAppointments.filter(appt => appt.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredAppointments));
  } catch (error) {
    console.error('Failed to remove appointment:', error);
    throw error;
  }
};

/**
 * Clear all appointments
 */
export const clearAppointments = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear appointments:', error);
    throw error;
  }
};