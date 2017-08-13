import React, { Component } from "react";
import Presenter from "@snakesilk/react-presenter";
import { ProgressBar } from "@snakesilk/react-loader-progress";
import SNEXConnect from "@snex/react-connect";
import SNEXMapper from "@snex/react-input-mapper";
import {createLoader} from './bootstrap';
import "./App.css";

class App extends Component {
  constructor(props) {
    super(props);
    this.loader = createLoader();
    this.game = this.loader.game;
  }

  componentDidMount() {
    this.loader.loadGame("./resource/Megaman2.xml");
  }

  attachSNEXController(controller) {
    controller.on("data", ({ key, state }) => {
      this.routeInput(key, state);
    });
  }

  routeInput(key, state) {
    this.game.input.trigger(key.toLowerCase(), state ? "keydown" : "keyup");
  }

  render() {
    return (
      <div className="App">
        <Presenter
          game={this.game}
          aspectRatio={16 / 9}
          fillWindow
          videoOverlay={<ProgressBar loader={this.loader} />}
        >
          <SNEXMapper
            onInput={({key, state}) => this.routeInput(key, state)}
            svgURL="/resource/nes-controller.svg"
          />

          <SNEXConnect
            type="nes"
            onConnection={cont => this.attachSNEXController(cont)}
          />
        </Presenter>
      </div>
    );
  }
}

export default App;
