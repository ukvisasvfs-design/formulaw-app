import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { ArrowLeft, Wallet as WalletIcon, Plus, History } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const ClientWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { axios, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'client') {
      navigate('/client');
      return;
    }
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await axios.get('/client/wallet');
      setWallet(response.data);
    } catch (error) {
      toast.error('Failed to fetch wallet');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('/client/wallet/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleTopup = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      // In production, this would integrate with Razorpay
      const response = await axios.post('/client/wallet/topup', {
        amount: parseFloat(amount),
        razorpay_payment_id: 'PLACEHOLDER_PAYMENT_ID'
      });
      
      toast.success(response.data.message);
      setAmount('');
      fetchWallet();
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to add money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/client/home')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#1877f2] to-[#166fe5] text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="w-5 h-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {wallet ? formatCurrency(wallet.balance) : '₹0'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Money</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  data-testid="topup-amount-input"
                />
                <div className="flex gap-2">
                  {[500, 1000, 2000].map(val => (
                    <Button
                      key={val}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(val.toString())}
                    >
                      ₹{val}
                    </Button>
                  ))}
                </div>
                <Button
                  className="w-full bg-[#1877f2] hover:bg-[#166fe5]"
                  onClick={handleTopup}
                  disabled={loading}
                  data-testid="topup-btn"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Money
                </Button>
                <p className="text-xs text-gray-500">Supports PhonePe, Google Pay, Paytm</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Transaction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {transactions.map((txn, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{txn.type}</p>
                      <p className="text-sm text-gray-500">{formatDate(txn.timestamp)}</p>
                    </div>
                    <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientWallet;
