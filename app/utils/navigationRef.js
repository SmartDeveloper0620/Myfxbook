import { createNavigationContainerRef, StackActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(url, params) {
	if (navigationRef.isReady()) {
		navigationRef.navigate(url, params);
	}
}

export function replace(url, params) {
	if (navigationRef.isReady()) {
		navigationRef.dispatch(StackActions.replace(url, params));
	}
}