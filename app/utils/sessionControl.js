import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'sessionID';

const setSessionID = async (sessionID) => {
	try {
		await AsyncStorage.setItem(SESSION_KEY, sessionID);
		console.log('SessionID saveed successfully.');
	} catch (error) {
		console.error('Error saving sessionID:', error);
	}
};

const getSessionID = async () => {
	try {
		const sessionID = await AsyncStorage.getItem(SESSION_KEY);
		return sessionID; // returns true if session exists, false otherwise
	} catch (error) {
		console.error('Error getting session:', error);
		return false;
	}
}

const clearSessionID = async () => {
	try {
		await AsyncStorage.removeItem(SESSION_KEY);
		console.log('SessionID cleared successfully.');
	} catch (error) {
		console.error('Error clearing sessionID:', error);
	}
}

export { setSessionID, getSessionID, clearSessionID };