const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
var request = require('request');
const binance_api = require('binance');
const bodyParser = require("body-parser");
const Binance = require('node-binance-api');

const connections = []
const port = 4001
const app = express()
app.use(bodyParser.json());

const server = http.createServer(app)
const io = socketIO(server, {'force new connection': true})

var LAST_CALL_TIME = Date.now();
var LAST_UPDATE_TIME = Date.now();
var LAST_PAGER = Date.now()-10000000;
var first_call = true;
var error_msg = "TEST FWNRFKWFNR DEKWDFMEW";
var bitbns = {};

const binanceWS = new binance_api.BinanceWS(true);

const binance = new Binance().options({
  APIKEY: '<key>',
  APISECRET: '<secret>'
});

var pager, PagerDuty;
PagerDuty = require('pagerduty');

pager = new PagerDuty({
  serviceKey: 'bac2bfb5dee94408d011f7d1455f9d0f'
});


function bitBnsPriceUpdate() {
  var options = {
    headers: {'user-agent': 'node.js'}
  }
  request('https://bitbns.com/order/getTickerWithVolume/', options, function (error, response, body) {
    if (error) {
    	error_msg = error
      console.log("Error in Bitbns call", error);
    } else {
	    bitbns_prices = JSON.parse(body) || [];
	    Object.keys(bitbns_prices).forEach(function(coin) {
	      bitbns[coin] = bitbns_prices[coin]["last_traded_price"];
	    });
	    if (bitbns_prices.length != 0) {
	    	LAST_UPDATE_TIME = Date.now()
	    }
	}
  });
}

function sendPagerAlert(message, extra_details={}) {
	if (Date.now() - LAST_PAGER < 300000) {
		return 0;
	}
	LAST_PAGER = Date.now()
	pager.create({
	  description: message, 
	  details: extra_details,
	  callback: function(err, response) {
	    if (err) throw err;
	 
	    // pager.acknowledge({
	    //   incidentKey: response.incident_key,
	    //   description: 'Got the pager error!',
	    //   details: {
	    //     foo: 'bar'
	    //   },
	    //   callback: function(err, response) {
	    //     if (err) throw err;
	 
	    //     pager.resolve({
	    //       incidentKey: response.incident_key,
	    //       description: 'Resolved the pager error!',
	    //       details: {
	    //         foo: 'bar'
	    //       },
	    //       callback: function(err, response) {
	    //         if (err) throw err;
	    //       }
	    //     });
	    //   }
	    // });
	  }
});
}

const getApiAndEmit = async socket => {



	// binanceWS.onTrade('BTCUSDT', data => {
	//     console.log(data);
	// });

	// binance.websockets.bookTickers( 'BTCUSDT', ticker => {
	binanceWS.onTrade('BTCUSDT', data => {
		// console.info("Price of BTC: ", ticker.bestBid);
		if (Date.now() - LAST_CALL_TIME > 10000 || first_call) {
			try {
	            bitBnsPriceUpdate();
	        }
	        catch (e) {
	          	console.log(e);
	        }
	        first_call = false
	        LAST_CALL_TIME = Date.now()
		}
		// socket.emit('price_change_btc', {
  //         coin: "BTC",
  //         price: ticker.bestBid,
  //         bprice: parseFloat(bitbns["BTC"]),
  //         usdtprice: parseFloat(bitbns["USDT"]),
  //         lastsync: (Date.now() - LAST_UPDATE_TIME),
  //         // error_msg: error_msg
  //       });
  		socket.emit('price_change_btc', {
          coin: "BTC",
          price: data["price"],
          bprice: parseFloat(bitbns["BTC"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME),
          // error_msg: error_msg
        });
	} );

	// binance.websockets.bookTickers( 'ETHUSDT', ticker => {
	binanceWS.onTrade('ETHUSDT', data => {

		binancePrice = data["price"];
		bnsPrice = parseFloat(bitbns["ETH"]);
		usdtPrice = parseFloat(bitbns["USDT"]);
		binanceInrPrice = binancePrice * usdtPrice;

		diff = parseFloat(bnsPrice - binanceInrPrice).toFixed(0);
        if (diff <= -2000) {
        	extra_details = {
        		coin: "ETH",
        		bnsPrice: bnsPrice,
        		binanceInrPrice: binanceInrPrice,
        		binancePrice: binancePrice,
        		usdtPrice: usdtPrice
        	}
        	message = "ETH Price Diff " + diff + " Buy Buy !!!";
        	sendPagerAlert(message, extra_details);
        }

		socket.emit('price_change_eth', {
          coin: "ETH",
          price: binancePrice,
          bprice: bnsPrice,
          usdtprice: usdtPrice,
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );

	// binance.websockets.bookTickers( 'XRPUSDT', ticker => {
	binanceWS.onTrade('XRPUSDT', data => {
		socket.emit('price_change_xrp', {
          coin: "XRP",
          price: data["price"],
          bprice: parseFloat(bitbns["XRP"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );

	binanceWS.onTrade('DOGEUSDT', data => {
		socket.emit('price_change_doge', {
          coin: "DOGE",
          price: data["price"],
          bprice: parseFloat(bitbns["DOGE"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );

	binanceWS.onTrade('ADAUSDT', data => {
		socket.emit('price_change_ada', {
          coin: "ADA",
          price: data["price"],
          bprice: parseFloat(bitbns["ADA"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );

	binanceWS.onTrade('MATICUSDT', data => {
		socket.emit('price_change_matic', {
          coin: "MATIC",
          price: data["price"],
          bprice: parseFloat(bitbns["MATIC"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );
};


io.on('connection', socket => {
  connections.push(socket);
  console.log('New client connected, Total Connections: ', connections.length);
  
  getApiAndEmit(socket);

  socket.on('disconnect', () => {
    connections.pop();
    console.log('user disconnected')
  })
})

server.listen(port, () => console.log(`Listening on port ${port}`))