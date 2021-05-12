import React, { Component } from "react";
import {LineChart} from 'react-easy-chart';

class App extends Component {
	constructor() {
		super();
		this.state = {
			graph_data: [],
			counter: 0
		}
	}

	setPlotGraph() {
		var c = this.state.counter;
		var d = this.state.graph_data;
		while(d.length > 600) {
			d.splice(0, 1);
		}
		c = c + 1;
		d.push({x: c, y: Math.random()*100});
		this.setState({
			graph_data: d,
			counter: c
		});
		console.log(this.state.graph_data);
	}

	componentDidMount() {
	    setInterval(() => this.setPlotGraph(), 1000);
	}

	render() {
	    return (  <LineChart
				    axes
				    yDomainRange={[0, 100]}
				    margin={{top: 10, right: 10, bottom: 50, left: 50}}
				    axisLabels={{x: 'My x Axis', y: 'My y Axis'}}
				    interpolate={'cardinal'}
				    width={1350}
				    height={450}
				    data =  {[this.state.graph_data]}
				  />)
	}
}

export default App;