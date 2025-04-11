import { useState, useEffect } from 'react';
import { Text, View, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getSessionID } from '../utils/sessionControl';
import { getClosedTradesApi, getAccount } from '../api/myfxbookapi';
import { router } from 'expo-router';

export default function Closed() {
  const [closedTrades, setClosedTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClosedTrades = async () => {
    try {
      const sessionID = await getSessionID();
      if (!sessionID) {
        router.replace('(auth)/login');
      } else {
        const sessionData = {
          sessionID: sessionID
        }
        const response = await getAccount(sessionData);
        if (response.error) {
          console.log(response.message);
        } else {
          const account = response.accounts[0];

          const reqData = {
            sessionID: sessionID,
            userId: account.id
          }
          try {
            const responseClosedTrades = await getClosedTradesApi(reqData);
            if (responseClosedTrades.error) {
              console.log('error->', responseClosedTrades.message);
            } else {
              setClosedTrades(responseClosedTrades.history || []);
            }
          } catch (error) {
            console.log("Error fetching open trades:", error);
          }
        }
      }
    } catch (errors) {
      console.log("Network error, please check your network");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosedTrades();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // const formatDate = (timestamp) => {
  //   try {
  //     // If timestamp is in milliseconds, create date directly
  //     // If timestamp is in seconds, multiply by 1000
  //     const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);

  //     // Check if date is valid
  //     if (isNaN(date.getTime())) {
  //       console.log('Invalid timestamp:', timestamp);
  //       return 'Invalid date';
  //     }

  //     return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  //   } catch (error) {
  //     console.log('Error formatting date:', error, 'timestamp:', timestamp);
  //     return 'Invalid date';
  //   }
  // };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>All symbols</Text>
        </View>
        <View style={styles.totalClosedTrades}>
          <Text style={styles.totalClosedTradesText}>Total: {closedTrades.length}</Text>
        </View>
        {/* <View style={styles.headerIcons}>
          <Ionicons name="cash-outline" size={24} color="#666" />
          <Ionicons name="swap-vertical" size={24} color="#666" />
          <Ionicons name="calendar-outline" size={24} color="#666" />
        </View> */}
      </View>

      <View style={styles.tradesList}>
        {closedTrades.map((trade, index) => {
          // Temporary logging to debug timestamp
          return (
            <View key={index} style={styles.tradeItem}>
              <View style={styles.tradeMain}>
                <View style={styles.tradeHeader}>
                  <View style={styles.symbolContainer}>
                    <Text style={styles.symbolText}>{trade.symbol}, </Text>
                    <Text style={trade.action.toLowerCase() === 'buy' ? styles.buyText : styles.sellText}>
                      {trade.action.toLowerCase()} {trade.sizing.value}
                    </Text>
                  </View>
                  <Text style={styles.timestamp}>{trade.closeTime}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceText}>
                    {trade.openPrice} → {trade.closePrice}
                  </Text>
                  <Text style={[styles.profitText, trade.profit < 0 ? styles.negative : styles.positive]}>
                    {trade.profit.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  titleContainer: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  tradesList: {
    padding: 16,
  },
  tradeItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  tradeMain: {
    gap: 4,
  },
  tradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  timestamp: {
    color: '#666',
    fontSize: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: '#666',
  },
  profitText: {
    fontWeight: '500',
  },
  positive: {
    color: '#34C759',
  },
  negative: {
    color: '#FF3B30',
  },
  totalClosedTrades: {
    fontSize: 14,
    color: '#666',
  },
  totalClosedTradesText: {
    fontSize: 14,
    color: '#666',
  },
});