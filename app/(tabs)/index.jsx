import { useEffect, useState } from 'react';
import { Text, View, StyleSheet, Alert, ScrollView } from 'react-native';
import { clearSessionID, getSessionID } from '../utils/sessionControl';
import { getAccount, getOpenTradesApi, logoutApi } from '../api/myfxbookapi';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from '../components/Toast';
import io from "socket.io-client";
import { BACKEND_URL } from '@env';
const ENDPOINT = BACKEND_URL;
console.log(ENDPOINT);
const socket = io(ENDPOINT, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// Add connection event listeners
socket.on('connect', () => {
  console.log('Socket connected successfully to:', ENDPOINT);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error.message);
  // You can show a toast or alert to the user here
  Alert.alert(
    "Connection Error",
    "Could not connect to the server. Please check your internet connection and try again.",
    [{ text: "OK" }]
  );
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

export default function Index() {
  const [sessionId, setSessionId] = useState("");
  const [accountData, setAccountData] = useState({
    balance: 0,
    equity: 0,
    profit: 0,
    name: ''
  });
  const [openTradesData, setOpenTradesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [balance, setBalance] = useState("");
  const [equity,setEquity] = useState("");
  const [profit,setProfit] = useState("");
  const checkSession = async () => {
    try {
      const sessionID = await getSessionID();
      setSessionId(sessionID);
      if (!sessionID) {
        router.replace('(auth)/login');
      } else {
        setShowToast(true);
        const sessionData = {
          sessionID: sessionID
        }
        const response = await getAccount(sessionData);
        if (response.error) {
          console.log(response.message);
        } else {
          const account = response.accounts[0];
          setAccountData({
            balance: account.balance,
            equity: account.equity,
            profit: account.profit,
            name: account.name
          });

          const reqData = {
            sessionID: sessionID,
            userId: account.id
          }
          console.log(account.id)
          socket.emit("join")
          socket.on('sendTrades', (trades,balance,equity) => {
            const copy_trades = Array.from(trades);
            setProfit(copy_trades.at(-1).profit);
            if(trades&&trades.length)
            {
              trades.pop();
              // console.log(trades);
              // console.log(balance,equity);
              setBalance(balance);
              setEquity(equity);
              setOpenTradesData(trades);

            }
          });
          // try {
          //   const responseOpenTrades = await getOpenTradesApi(reqData);
          //   if (responseOpenTrades.error) {
          //     console.log('error->', responseOpenTrades.message);
          //   } else {
          //     setOpenTradesData(responseOpenTrades.openTrades || []);
          //     console.log(responseOpenTrades)
          //   }
          // } catch (error) {
          //   console.log("Error fetching open trades:", error);
          // }
        }
      }
    } catch (errors) {
      console.log("Network error, please check your network");
    } finally {
      setLoading(true);
    }
  }

  const handleLogout = async () => {
    const logoutData = { sessionID: sessionId }
    try {
      clearSessionID();
      await logoutApi(logoutData);
      router.replace('(auth)/login');
    } catch (error) {
      console.log("Logout error:", error);
    }
  }
  useEffect(() => {
    checkSession();


    return () => {
      socket.off("sendTrades");
    };
  }, [])

  if (!loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Toast
        message={`Welcome! ${accountData.name}`}
        visible={showToast}
        onHide={() => setShowToast(false)}
      />
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity> */}
        <Text style={styles.headerTitle}>Trade</Text>
        <View style={styles.headerRight}>
          {/* <TouchableOpacity>
            <Ionicons name="swap-vertical" size={24} color="black" />
          </TouchableOpacity> */}
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profitLoss}>
        <Text style={styles.profitLossText}>{profit} USD</Text>
      </View>

      <View style={styles.accountInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Balance:</Text>
          <Text style={styles.infoValue}>{balance}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Equity:</Text>
          <Text style={styles.infoValue}>{equity}</Text>
        </View>
      </View>
      <View style={styles.positionsSection}>
        <View style={styles.positionsHeader}>
          <Text style={styles.positionsTitle}>Positions</Text>
          <Text style={styles.positionsTotal}>Total: {openTradesData.length}</Text>
        </View>
        {openTradesData.map((trade, index) => ( 
          <View key={index} style={styles.positionItem}>
            <View style={styles.positionLeft}>
              <View style={styles.symbolContainer}>
                <Text style={styles.symbolText}>{trade.symbol}, </Text>
                <Text style={trade.action.toLowerCase() === 'Buy' ? styles.buyText : styles.sellText}>{trade.action.toLowerCase()} {trade.lots}</Text>
              </View>
              <Text style={styles.priceText}>{trade.openPrice} → {trade.pips}</Text>
            </View>
            <Text style={[styles.profitText, trade.profit < 0 ? styles.negative : styles.positive]}>
              {parseFloat(trade.profit).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  profitLoss: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profitLossText: {
    fontSize: 24,
    color: '#FF3B30',
    fontWeight: '500',
  },
  accountInfo: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    color: '#666',
  },
  infoValue: {
    fontWeight: '500',
  },
  positionsSection: {
    padding: 16,
  },
  positionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionsTotal: {
    fontSize: 16,
    color: '#666',
  },
  positionsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  positionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  positionLeft: {
    flex: 1,
  },
  symbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  symbolText: {
    fontSize: 16,
    fontWeight: '500',
  },
  buyText: {
    color: '#34C759',
  },
  sellText: {
    color: '#FF3B30',
  },
  priceText: {
    color: '#666',
    marginTop: 4,
  },
  profitText: {
    fontWeight: '500',
  },
  negative: {
    color: '#FF3B30',
  },
  positive: {
    color: '#34C759',
  },
});