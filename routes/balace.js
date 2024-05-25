const express = require('express');
const balanceRouter = express.Router();
const Trade = require('../models/trade');
const { log } = require('console');

balanceRouter.post('/balance', (req, res) => {
  const timestamp = new Date(req.body.timestamp);
  
  if (isNaN(timestamp)) {
    return res.status(400).send('Invalid timestamp format.');
  }

  Trade.find({ utc_time: { $lte: timestamp } })
    .then(trades => {
      const balances = {};
        var cnt=0;
      trades.forEach(trade => {
        cnt++;
        if (!balances[trade.base_coin]) {
          balances[trade.base_coin] = 0;
        }

        if (trade.operation === 'Buy') {
            console.log(trade.amount);
          balances[trade.base_coin] += trade.amount;
        } else if (trade.operation === 'Sell') {
          balances[trade.base_coin] -= trade.amount;
        }
      });
    
      // Remove assets with zero balance
      Object.keys(balances).forEach(key => {
        if (balances[key] === 0) {
          delete balances[key];
        }
      });

      return res.status(200).send(balances);
    })
    .catch(err => {
      console.error('Error fetching trades:', err);
      res.status(500).send('Error fetching trades.');
    });
});

module.exports = balanceRouter;
