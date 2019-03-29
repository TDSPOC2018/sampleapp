import React from 'react';
import { View, Text, StyleSheet, Button, Image, ActivityIndicator } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { TouchableOpacity, TextInput } from 'react-native-gesture-handler';
import ActionSheet from 'react-native-actionsheet'
import ImagePicker from 'react-native-image-crop-picker';
import Voice from 'react-native-voice';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const APPLICATION_ID = 'dj00aiZpPXlWelE4TzN4VjNqaiZzPWNvbnN1bWVyc2VjcmV0Jng9Yzg-'
const URL_MAP_API = 'https://map.yahooapis.jp/search/zip/V1/zipCodeSearch'
const URL_API = 'https://api.example.com'
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  imageContainer: {
    marginTop: 64,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column'
  },
  imageView: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 1,
    borderColor: 'black'
  },
  infoContainer: {
    marginTop: 32,
    flexDirection: 'column',
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row', width: '100%', justifyContent: 'center'
  },
  input: {
    height: 36, width: '70%', borderBottomColor: 'gray', borderBottomWidth: 1, marginTop: 12,
    alignSelf: 'center'
  },
  inputMic: {
    width: 24, height: 24, resizeMode: 'center', marginTop: 16 
  }
});

class Launch extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      profileImage: null,
      name: '',
      postalCode: '',
      isLoading: false,
      address: '',
      subaddress: '',
      email: '',
      freeword: '',
      coordinates: '',
      height: 36,
      voice: '',
      voicePartial: '',
      currentRecording: '',
      isRecording: false,
    }
    this.showActionSheet = this.showActionSheet.bind(this)
    this.gotoMap = this.gotoMap.bind(this)
    Voice.onSpeechResults = this.onSpeechResults;
    Voice.onSpeechPartialResults = this.onSpeechPartialResults;
    Voice.onSpeechEnd = this.onSpeechEnd;
  }

  showActionSheet() {
    this.ActionSheet.show()
  }

  onChangeText(text, type) {
    if (type == 'name') {
      this.setState({ name: text })
    } else if (type == 'postal') {
      this.setState({ postalCode: text })
      this.onInputPostal(text)
    } else if (type == 'subaddress') {
      this.setState({ subaddress: text })
    } else if (type == 'freeword') {
      this.setState({ freeword: text })
    }
  }

  onSpeechResults= e => {
    console.log('onSpeechResults: ', e);
    this.setState({
      voice: e.value,
    });
   
  };

  onSpeechPartialResults = e => {
    console.log('onSpeechPartialResults: ', e);
    this.setState({
      voicePartial: e.value,
    });
    Voice.stop()
  };

  onSpeechEnd = e => {
    // eslint-disable-next-line
    const { currentRecording, voice } = this.state
    if (currentRecording == 'name') {
      const { name } = this.state
      this.setState({name: name + voice[0]})
    } else if (currentRecording == 'postal') {
      const { postalCode } = this.state
      this.setState({postalCode: postalCode + voice[0]})
    } else if (currentRecording == 'subaddress') {
      const { subaddress } = this.state
      this.setState({subaddress: subaddress + voice[0]})
    } else if (currentRecording == 'freeword') {
      const { freeword } = this.state
      this.setState({freeword: freeword + voice[0]})
    }
    
    if (currentRecording != '') {
      Voice.start('ja_JP')
    }
  };

  updateSize(height) {
    this.setState({
      height: height + 16
    });
  }

  async onInputPostal(text) {
    this.setState({ isLoading: true })
    const response = await fetch(`${URL_MAP_API}?query=${text}&appid=${APPLICATION_ID}&output=json`)
    if (response.status >= 200 && response.status < 400) {
      const result = await response.json();
      if (result['ResultInfo']['Count'] == 0) {
        this.setState({
          isLoading: false,
          address: 'error'
        })
      } else {
        this.setState({
          isLoading: false,
          address: result['Feature'][0]['Property']['Address'],
          coordinates: result['Feature'][0]['Geometry']['Coordinates']
        })
        console.log(this.state.address)
      }
    } else {
      this.setState({
        isLoading: false,
        address: 'error'
      })
    }
  }

  async postInfo() {
    const { name, address, subaddress, freeword } = this.state
    const response = await fetch(`${URL_API}`, {
      method: 'POST',
      body: JSON.stringify({
        'name': name,
        'address': address,
        'subaddress': subaddress,
        'freeword': freeword,
      })
    })
  }

  gotoMap() {
    const { coordinates, address } = this.state
    let longitude = coordinates.split(',')[0]
    let latitude = coordinates.split(',')[1]
    Actions.map({ data: { latitude: latitude, longitude: longitude, address: address } })
  }

  onInputVoice(type) {
    var { isRecording, currentRecording } = this.state
    if (currentRecording == type) {
      Voice.stop()
      this.setState({
        currentRecording: '',
      })
    } else {
      this.setState({
        currentRecording: type
      })
      Voice.start('ja_JP')
    }
  }
  render() {
    const { profileImage, name, postalCode, isLoading, address, subaddress, freeword, height, currentRecording } = this.state

    let newStyle = {
      height
    }
    return (
      <View {...this.props} style={styles.container}>
        <View style={styles.imageContainer}>
          {
            profileImage &&
            <Image
              style={styles.imageView}
              source={{ uri: `data:${profileImage.mime};base64,${profileImage.data}` }}
            /> ||
            <Image
              style={styles.imageView}
              source={require('../asset/profile.png')}
            />
          }
          <TouchableOpacity style={{ paddingTop: 12 }} onPress={this.showActionSheet}>
            <Text style={{ color: 'darkblue' }}>写真選択</Text>
          </TouchableOpacity>
        </View>

        <KeyboardAwareScrollView
          style={styles.infoContainer}
        >
          <View style={styles.inputContainer}>
            <TextInput
              value={name}
              placeholder={'名'}
              style={styles.input}
              onChangeText={text => this.onChangeText(text, 'name')}
            />
            <TouchableOpacity onPress={() => this.onInputVoice('name')}>
            {
              currentRecording == 'name' &&
              <Image source={require('../asset/mic_off.png')} style={styles.inputMic} resizeMode={'contain'} /> ||
              <Image source={require('../asset/mic.png')} style={styles.inputMic} resizeMode={'contain'} />
            }
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={postalCode}
              placeholder={'郵便番号: (000-0000)'}
              style={styles.input}
              onChangeText={text => this.onChangeText(text, 'postal')}
            />
            <TouchableOpacity onPress={() => this.onInputVoice('postal')}>
            {
              currentRecording == 'postal' &&
              <Image source={require('../asset/mic_off.png')} style={styles.inputMic} resizeMode={'contain'} /> ||
              <Image source={require('../asset/mic.png')} style={styles.inputMic} resizeMode={'contain'} />
            }
            </TouchableOpacity>
          </View>

          <View style={[styles.input, { justifyContent: 'center', width: '75%' }]}>
            {
              isLoading &&
              <ActivityIndicator size="small" /> || (
                address == 'error' &&
                <Text style={{ color: 'red' }}>正しい郵便番号を入力してください。</Text> ||
                <Text>{address}</Text>
              )
            }
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              value={subaddress}
              placeholder={'住所'}
              style={styles.input}
              onChangeText={text => this.onChangeText(text, 'subaddress')}
            />
            <TouchableOpacity onPress={() => this.onInputVoice('subaddress')}>
            {
              currentRecording == 'subaddress' &&
              <Image source={require('../asset/mic_off.png')} style={styles.inputMic} resizeMode={'contain'} /> ||
              <Image source={require('../asset/mic.png')} style={styles.inputMic} resizeMode={'contain'} />
            }
            </TouchableOpacity>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              value={freeword}
              placeholder={'フリーワード入力'}
              style={[styles.input, { marginBottom: 16 }, newStyle]}
              multiline
              onChangeText={text => this.onChangeText(text, 'freeword')}
              onContentSizeChange={(e) => this.updateSize(e.nativeEvent.contentSize.height)}
            />
            <TouchableOpacity onPress={() => this.onInputVoice('freeword')}>
            {
              currentRecording == 'freeword' &&
              <Image source={require('../asset/mic_off.png')} style={styles.inputMic} resizeMode={'contain'} /> ||
              <Image source={require('../asset/mic.png')} style={styles.inputMic} resizeMode={'contain'} />
            }
            </TouchableOpacity>
          </View>

          <Button title="マップでアドレスを見る" onPress={this.gotoMap} disabled={!(address != 'error' && address != '')} />
          <Button title="送信" onPress={() => this.postInfo()} />
        </KeyboardAwareScrollView>

        <ActionSheet
          ref={o => this.ActionSheet = o}
          title={'Which one do you like ?'}
          options={['カメラ', 'ライブラリー', 'キャンセル']}
          cancelButtonIndex={2}
          onPress={(index) => {
            if (index == 0) { // camera
              ImagePicker.openCamera({
                width: 300,
                height: 300,
                includeBase64: true,
                cropping: true
              }).then(image => {
                this.setState({
                  profileImage: image
                })
              });
            } else if (index == 1) {
              ImagePicker.openPicker({
                width: 300,
                height: 300,
                includeBase64: true,
                cropping: true
              }).then(image => {
                this.setState({
                  profileImage: image
                })
              });
            }
          }}
        />
      </View>
    );
  }
}

export default Launch;
