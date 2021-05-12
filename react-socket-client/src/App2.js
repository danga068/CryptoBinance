import React from 'react';
import ReactNotifications from 'react-browser-notifications';
 
class App extends React.Component {
  constructor() {
    super();
    this.showNotifications = this.showNotifications.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }
 
  showNotifications() {
    // If the Notifications API is supported by the browser
    // then show the notification
    if(this.n.supported()) this.n.show();
  }
 
  handleClick(event) {
    // Do something here such as
    // console.log("Notification Clicked") OR
    // window.focus() OR
    // window.open("http://www.google.com")
 
    // Lastly, Close the notification
    this.n.close(event.target.tag);
  }
 
  render() {
    return (
      <div>
 
        <ReactNotifications
          onRef={ref => (this.n = ref)} // Required
          title="Hey There!" // Required
          body="This is the body"
          icon="icon.png"
          tag="abcdef"
          timeout="60000"
          onClick={event => this.handleClick(event)}
        />
 
        <button onClick={this.showNotifications}>
          Notify Me!
        </button>
 
      </div>
    )
  }
}

export default App;