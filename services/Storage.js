import { AsyncStorage } from 'react-native';

class Storage {
	static get(key) {
		return AsyncStorage.getItem(key).then(function(value) {
			return JSON.parse(value);
		});
	}

	static set(key, value) {
		return AsyncStorage.setItem(key, JSON.stringify(value));
	}

	static remove(key) {
		return AsyncStorage.removeItem(key);
	}
};

export default Storage;
