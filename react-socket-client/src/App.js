import React, { Component } from "react";
import socketIOClient from "socket.io-client";

const emptyValue = {
  USD: '',
  INR: ''
}

const dollar = 80.5

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://159.65.191.40:4001", //"http://127.0.0.1:4001"
      coins: ["DOGE", "XRP", "ADA", "MATIC", "ETH", "BTC"],
      BTC: emptyValue,
      XRP: emptyValue,
      DOGE: emptyValue,
      ETH: emptyValue,
      ADA: emptyValue,
      MATIC: emptyValue
    };
  }

  formatPrice(price) {
    if (Math.floor(price / 1000)) {
      return parseFloat(price).toFixed(0);
    }
    if (Math.floor(price / 10)) {
      return parseFloat(price).toFixed(2);
    }
    return parseFloat(price).toFixed(4);
  }

  componentDidMount() {
    const { endpoint } = this.state;
    const socket = socketIOClient(endpoint, {'force new connection': true});
    socket.on("price_change_btc", data => {
      if (data.usdtprice === undefined || data.usdtprice == 0) {
        this.usdtprice = dollar;
      } else {
        this.usdtprice = data.usdtprice;
      }
      this.inr_price = data.price * this.usdtprice;
      document.title = this.state.BTC.USD
      this.setState({
        [data.coin]: {
          USD: this.formatPrice(data.price),
          INR: this.formatPrice(this.inr_price),
          BNS: data.bprice,
          USDT: this.usdtprice,
          SYNC: Math.floor(data.lastsync/1000)
        }
      });
    });

    socket.on("price_change_eth", data => {
      if (data.usdtprice === undefined || data.usdtprice == 0) {
        this.usdtprice = dollar;
      } else {
        this.usdtprice = data.usdtprice;
      }
      this.inr_price = data.price * this.usdtprice;
      this.setState({
        [data.coin]: {
          USD: this.formatPrice(data.price),
          INR: this.formatPrice(this.inr_price),
          BNS: data.bprice,
          USDT: this.usdtprice,
          SYNC: Math.floor(data.lastsync/1000)
        }
      });
    });

    socket.on("price_change_ada", data => {
      if (data.usdtprice === undefined || data.usdtprice == 0) {
        this.usdtprice = dollar;
      } else {
        this.usdtprice = data.usdtprice;
      }
      this.inr_price = data.price * this.usdtprice;
      this.setState({
        [data.coin]: {
          USD: this.formatPrice(data.price),
          INR: this.formatPrice(this.inr_price),
          BNS: data.bprice,
          USDT: this.usdtprice,
          SYNC: Math.floor(data.lastsync/1000)
        }
      });
    });

    socket.on("price_change_xrp", data => {
      if (data.usdtprice === undefined || data.usdtprice == 0) {
        this.usdtprice = dollar;
      } else {
        this.usdtprice = data.usdtprice;
      }
      this.inr_price = data.price * this.usdtprice;
      this.setState({
        [data.coin]: {
          USD: this.formatPrice(data.price),
          INR: this.formatPrice(this.inr_price),
          BNS: data.bprice,
          USDT: this.usdtprice,
          SYNC: Math.floor(data.lastsync/1000)
        }
      });
    });

    socket.on("price_change_matic", data => {
      if (data.usdtprice === undefined || data.usdtprice == 0) {
        this.usdtprice = dollar;
      } else {
        this.usdtprice = data.usdtprice;
      }
      this.inr_price = data.price * this.usdtprice;
      this.setState({
        [data.coin]: {
          USD: this.formatPrice(data.price),
          INR: this.formatPrice(this.inr_price),
          BNS: data.bprice,
          USDT: this.usdtprice,
          SYNC: Math.floor(data.lastsync/1000)
        }
      });
    });

    socket.on("price_change_doge", data => {
      if (data.usdtprice === undefined || data.usdtprice == 0) {
        this.usdtprice = dollar;
      } else {
        this.usdtprice = data.usdtprice;
      }
      this.inr_price = data.price * this.usdtprice;
      this.setState({
        [data.coin]: {
          USD: this.formatPrice(data.price),
          INR: this.formatPrice(this.inr_price),
          BNS: data.bprice,
          USDT: this.usdtprice,
          SYNC: Math.floor(data.lastsync/1000)
        }
      });
    });
  }

  render() {
    const that = this;

    return (
      <div className="container">
        <div className="row">
          <div className="col s12 board">
            <table id="simple-board" align="center" bgcolor="#F2F1F1" width="90%">
              <tbody>
                <tr height="40px">
                  <td width="20%" bgcolor="#FDEBD0">COIN\PRICE</td>
                  <td width="20%" bgcolor="#FDEBD0">Binance</td>
                  <td width="20%" bgcolor="#FDEBD0">Binance INR</td>
                  <td width="20%" bgcolor="#FDEBD0">Bitbns</td>
                  <td width="20%" bgcolor="#FDEBD0">Bitbns USDT</td>
                </tr>
                {
                  this.state.coins.map(function (coin) {
                    return (
                      <tr height="45px" border="1px solid darkorange">
                        <td bgcolor="#E6B0AA">{coin}</td>
                        <td bgcolor="#EBEDEF">${that.state[coin].USD}</td>
                        <td bgcolor="#EBEDEF">{'\u20B9'}{that.state[coin].INR}</td>
                        <td bgcolor="#EBEDEF">{'\u20B9'}{that.state[coin].BNS}</td>
                        <td bgcolor="#EBEDEF">{'\u20B9'} {that.state[coin].USDT} {"( "} {that.state[coin].SYNC} {" sec ago)"}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
