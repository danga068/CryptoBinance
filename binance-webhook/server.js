const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
var request = require('request');
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
var LAST_PAGER = Date.now()-100000;
var first_call = true;
var error_msg = "TEST FWNRFKWFNR DEKWDFMEW";
var bitbns = {};

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

function sendPagerAlert(message) {
	if (Date.now() - LAST_PAGER < 300000) {
		return 0;
	}
	LAST_PAGER = Date.now()
	pager.create({
	  description: message, 
	  details: {},
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
	binance.websockets.bookTickers( 'BTCUSDT', ticker => {
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
		socket.emit('price_change_btc', {
          coin: "BTC",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["BTC"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME),
          // error_msg: error_msg
        });
	} );

	binance.websockets.bookTickers( 'ETHUSDT', ticker => {
		socket.emit('price_change_eth', {
          coin: "ETH",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["ETH"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });

        diff = parseFloat(parseFloat(bitbns["ETH"]) - ticker.bestBid * parseFloat(bitbns["USDT"])).toFixed(0)
        if (diff <= -2000) {
        	sendPagerAlert("Price Diff " + diff + " Buy Buy !!!");
        }
	} );

	binance.websockets.bookTickers( 'XRPUSDT', ticker => {
		// console.info("Price of XRP: ", ticker.bestBid);
		socket.emit('price_change_xrp', {
          coin: "XRP",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["XRP"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );

	binance.websockets.bookTickers( 'DOGEUSDT', ticker => {
		// console.info("Price of DOGE: ", ticker.bestBid);
		socket.emit('price_change_doge', {
          coin: "DOGE",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["DOGE"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );

	binance.websockets.bookTickers( 'ADAUSDT', ticker => {
		// console.info("Price of DOGE: ", ticker.bestBid);
		socket.emit('price_change_ada', {
          coin: "ADA",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["ADA"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_UPDATE_TIME)
        });
	} );

	binance.websockets.bookTickers( 'MATICUSDT', ticker => {
		// console.info("Price of XRP: ", ticker.bestBid);
		socket.emit('price_change_matic', {
          coin: "MATIC",
          price: ticker.bestBid,
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