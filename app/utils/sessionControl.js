import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'sessionID';
const SESSION_EXPIRY_KEY = 'sessionExpiry';
const SESSION_DURATION = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

const setSessionID = async (sessionID) => {
  try {
    const expiryTime = Date.now() + SESSION_DURATION;
    await AsyncStorage.setItem(SESSION_KEY, sessionID);
    await AsyncStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error saving sessionID:', error);
  }
};

const getSessionID = async () => {
  try {
    const sessionID = await AsyncStorage.getItem(SESSION_KEY);
    const expiryTime = await AsyncStorage.getItem(SESSION_EXPIRY_KEY);

    if (!sessionID || !expiryTime) {
      return null;
    }

    // Check if session has expired
    if (Date.now() > parseInt(expiryTime)) {
      // Session expired, clear it
      await clearSessionID();
      return null;
    }

    return sessionID;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

const clearSessionID = async () => {
  try {
    await AsyncStorage.removeItem(SESSION_KEY);
    await AsyncStorage.removeItem(SESSION_EXPIRY_KEY);
  } catch (error) {
    console.error('Error clearing sessionID:', error);
  }
}

// Named exports
export { setSessionID, getSessionID, clearSessionID };

// Default export
const sessionControl = {
  setSessionID,
  getSessionID,
  clearSessionID
};

export default sessionControl;