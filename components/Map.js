import React from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { Actions } from 'react-native-router-flux';
import MapView, { Marker, ProviderPropType } from 'react-native-maps';
import { TouchableOpacity } from 'react-native-gesture-handler';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  address: {
    position: 'absolute', justifyContent: 'center', top: 16, zIndex: 999,
    color: 'red'
  }
});

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default class extends React.Component {
  map = null;

  constructor(props) {
    super(props)
    this.state = {
      region: {
        latitude: Number(this.props.data.latitude),
        longitude: Number(this.props.data.longitude),
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      markers: [],
    };
    this.onMapReady = this.onMapReady.bind(this)
  }
  static onEnter = () => {
    Actions.refresh({
      title: this.props.title,
    });
  };

  onMapReady() {
    const { region } = this.state
    this.map.animateToRegion(region, 10)
  }

  render() {
    const address = this.props.data.address
    return (
      <View style={[styles.container, this.props.style]}>
        
        <Text style={styles.address} onPress={() => { this.map.animateToRegion(this.state.region, 10)}}>{address}</Text>
    
        <MapView
          initialRegion={this.state.region}
          ref={ map => { this.map = map }}
          style={styles.map}
          onMapReady={this.onMapReady}  
        >
          <Marker
            title={address}
            coordinate={this.state.region}
          >
          </Marker>
        </MapView>
      </View>
    );
  }
}
