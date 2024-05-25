const mongoose=require("mongoose");
const tradeSchema=mongoose.Schema({
    user_id: { 
        type: String, 
        required: true 
    },
    utc_time: { 
        type: Date, 
        required: true
    },
    operation: { 
        type: String, 
        enum: ['Buy', 'Sell'], 
        required: true 
    },
    market: { 
        type: String, 
        required: true 
    },
    base_coin: { 
        type: String, 
        required: true 
    },
    quote_coin: { 
        type: String, 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    price: { 
        type: Number, 
        required: true 
    }
});
const Trade = mongoose.model('Trade',tradeSchema);
module.exports=Trade;