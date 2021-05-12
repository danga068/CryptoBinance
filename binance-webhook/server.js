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

var LAST_CALL_TIME = Date.now()
var first_call = true
var bitbns = {}

const binance = new Binance().options({
  APIKEY: '<key>',
  APISECRET: '<secret>'
});


function bitBnsPriceUpdate() {
  var options = {
    headers: {'user-agent': 'node.js'}
  }
  request('https://bitbns.com/order/getTickerWithVolume/', options, function (error, response, body) {
    if (error) {
      console.log("Error in Bitbns call", error);
    } else {
	    bitbns_prices = JSON.parse(body) || [];
	    Object.keys(bitbns_prices).forEach(function(coin) {
	      bitbns[coin] = bitbns_prices[coin]["last_traded_price"];
	    });
	    LAST_CALL_TIME = Date.now()
	}
  });
}

const getApiAndEmit = async socket => {
	binance.websockets.bookTickers( 'BTCUSDT', ticker => {
		// console.info("Price of BTC: ", ticker.bestBid);
		socket.emit('price_change', {
          coin: "BTC",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["BTC"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_CALL_TIME)
        });
	} );

	binance.websockets.bookTickers( 'XRPUSDT', ticker => {
		// console.info("Price of XRP: ", ticker.bestBid);
		if (Date.now() - LAST_CALL_TIME > 20000 || first_call) {
			first_call = false
			try {
	            bitBnsPriceUpdate();
	        }
	        catch (e) {
	          	console.log(e);
	        }
		}
		socket.emit('price_change', {
          coin: "XRP",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["XRP"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_CALL_TIME)
        });
	} );

	binance.websockets.bookTickers( 'DOGEUSDT', ticker => {
		// console.info("Price of DOGE: ", ticker.bestBid);
		socket.emit('price_change', {
          coin: "DOGE",
          price: ticker.bestBid,
          bprice: parseFloat(bitbns["DOGE"]),
          usdtprice: parseFloat(bitbns["USDT"]),
          lastsync: (Date.now() - LAST_CALL_TIME)
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