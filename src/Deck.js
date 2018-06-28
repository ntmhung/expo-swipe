/**
 * Created by minhhung on 6/24/18.
 */
import React, {Component} from "react";
import {View, Animated, PanResponder} from "react-native";

class Deck extends Component {
    constructor(props) {
        super(props);

        const position = new Animated.ValueXY();

        const panResponder = PanResponder.create({
            /**
             * Execute anytime user taps on the screen.
             * If return TRUE, the whole instance of PanResponder will be responsible for pressing on the screen
             * @return Boolean
             */
            onStartShouldSetPanResponder: () => true,

            /**
             * Execute anytime user drag finger around the screen.
             */
            onPanResponderMove: (event, gesture) => {
                position.setValue({x: gesture.dx, y: gesture.dy})
            },

            /**
             * Execute anytime user move finger out of screen.
             */
            onPanResponderRelease: () => {

            }

        });

        //not necessary to do this
        this.state = {panResponder, position};
    }

    renderCards() {
        return this.props.data.map((item, index) => {
            if(index == 0){
                return (
                    <Animated.View
                        key={item.id}
                        style=style={this.state.position.getLayout()}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                );
            }
            return this.props.renderCard(item);
        })
    }

    render() {
        return (
            <View
                style=style={this.state.position.getLayout()}
                {...this.state.panResponder.panHandlers}
            >
                {this.renderCards()}
            </View>
        )
    }
}

export default Deck;