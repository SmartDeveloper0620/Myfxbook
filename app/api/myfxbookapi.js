const BASE_URL = "https://www.myfxbook.com/api";

//Login with Myfxbook
export async function loginApi(params) {
	try {
		const response = await fetch(
			`${BASE_URL}/login.json?email=${params.email}&password=${params.password}`
		);
		const data = await response.json();

		if (data.error) {
			throw new Error(data.message || "Failed to login myfxbook");
		}
		return data;
	} catch (error) {
		throw new Error("Failed to login myfxbook");
	}
}
//Get account data using sessionID from Myfxbook
export async function getAccount(params) {
	try {
		const response = await fetch(
			`${BASE_URL}/get-my-accounts.json?session=${params.sessionID}`
		);
		const data = await response.json();

		if (data.error) {
			throw new Error(data.message || "Failed to get account from myfxbook");
		}
		return data;
	} catch (error) {
		throw new Error("Failed to get account from myfxbook");
	}
}

//Logout from Myfxbook
export async function logoutApi(params) {
	console.log("----params---", params.sessionID)
	try {
		const response = await fetch(
			`${BASE_URL}/logout.json?session=${params.sessionID}`
		);
		const data = await response.json();
		console.log("----data---", data)
		if (data.error) {
			throw new Error(data.message || "Failed to logout from myfxbook1");
		}
		return data;
	} catch (error) {
		throw new Error("Failed to logout from myfxbook2");
	}
}

//Get all openTrades data from Myfxbook
export async function getOpenTradesApi(params) {
	try {
		const response = await fetch(
			`${BASE_URL}/get-open-trades.json?session=${params.sessionID}&id=${params.userId}`
		);
		const data = await response.json();

		if (data.error) {
			throw new Error(data.message || "Failed to fetch open trades");
		}
		return data;
	} catch (error) {
		throw new Error("Failed to fetch open trades");
	}
}

//Get all closedTrades from Myfxbook
export async function getClosedTradesApi(params) {
	try {
		const response = await fetch(
			`${BASE_URL}/get-history.json?session=${params.sessionID}&id=${params.userId}`
		);
		const data = await response.json();

		if (data.error) {
			throw new Error(data.message || "Failed to fetch closed trades");
		}
		return data;
	} catch (error) {
		throw new Error("Failed to fetch closed trades");
	}
}
