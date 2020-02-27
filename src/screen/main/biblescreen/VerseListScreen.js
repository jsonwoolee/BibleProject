import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Image,
  Clipboard,
  AsyncStorage,
} from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import BibleListOption from '/components/option/BibleListOption';
import BibleNoteOption from '/components/option/BibleNoteOption';
import FontChangeOption from '/components/option/FontChangeOption';


// SQLITE 성공/실패 예외처리
const errorCallback = (e) => {
  console.log('Error');
  // console.log(e.message);
};
const okCallback = (result) => {
  console.log('okay');
  // console.log(result);
};

/**
 * 축약 문자열 표현을 위한 함수.
 */
function textLengthOverCut(txt, len, lastTxt) {
  if (len == "" || len == null) { // 기본값
    len = 30;
  }
  if (lastTxt == "" || lastTxt == null) { // 기본값
    lastTxt = "...";
  }
  if (txt.length > len) {
    txt = txt.substr(0, len) + lastTxt;
  }
  return txt;
}


export default class VerseListScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      verseItems: [],
      modalVisible: false,
      bibleListOptionIconUri: require('assets/ic_option_list_off.png'),
      bibleNoteOptionIconUri: require('assets/ic_option_note_off.png'),
      fontChangeOptionIconUri: require('assets/ic_option_font_off.png'),
      optionComponentState: '',
    };
    this.hightlightList = [];
    this.clipboardText = null;
    this.modalBibleItem = null;
  }

  componentDidMount() {
    const { route } = this.props;
    const {bookName, bookCode, chapterCode}  = route.params;
    let bibleDB = SQLite.openDatabase({name : "bible.db", createFromLocation : 1}, okCallback, errorCallback);

    bibleDB.transaction((tx) => {
      //성경의 절과 내용을 모두 가져오는 쿼리를 선언
      const query = `SELECT verse, content FROM bible_korHRV where book = ${bookCode} and chapter = ${chapterCode}`;
      tx.executeSql(query, [],
        (tx, results) => {
        let verseItemsLength = results.rows.length;
        const verseItems = [];

        for (let i = 0; i < verseItemsLength; i++) {
          const content = results.rows.item(i).content;
          const verseCode = results.rows.item(i).verse;
          verseItems.push(
            {
              bookName,
              bookCode,
              chapterCode,
              content,
              verseCode
            })
        }
        this.setState({verseItems});
      })
    })
  }

  goToContentListScreen = (bookInfo) => {
    this.props.navigation.navigate('ContentListScreen',
      {
        bookName: bookInfo.bookName,
        bookCode: bookInfo.bookCode,
        chapterCode: bookInfo.chapterCode,
      });
  };

  // // ScrollTo 테스트
  // flatListRef;
  // scrollTo = () =>{
  //   console.log('scrollTo');
  //   this.flatListRef.scrollToIndex({animated: true, index: 20-1})
  // };

  // 모달 화면을 on/off 하는 메서드.
  setModalVisible(visible, modalAction) {
    this.setState({modalVisible: visible});
    const {bibleName, bibleCode, chapterCode, verseCode, content} = this.modalBibleItem;
    switch (modalAction) {
      case 'copy':
        console.log('복사');
        console.log(content);
        Clipboard.setString(content);
        //TODO: 토스트 기능 구현
        break;
      case 'highlight':
        break;
      case 'memo':
        break;
    }
  }

  // 성경의 아이템을 길게 눌렀을때 모달 화면을 보여주는 메서드.
  // 복사, 형광펜, 메모 기능을 위해 해당 값을 전달받는다.
  onLongPressButton = (item) => () => {
    this.modalBibleItem = item;
    this.setModalVisible(true);
  };

  // 하단 3개의 옵션 버튼 클릭시 아이콘을 바꿔주고 해당 옵션에 대한 컴포넌트를 렌더링 하기 위한 state를 바꿔줌.
  onClickOptionButton = (optionType) => () => {
    switch (optionType) {
      case 'bibleList':
        this.setState({
          bibleListOptionIconUri: require('assets/ic_option_list_on.png'),
          bibleNoteOptionIconUri: require('assets/ic_option_note_off.png'),
          fontChangeOptionIconUri: require('assets/ic_option_font_off.png'),
          optionComponentState: 'bibleList',
        });
        break;
      case 'bibleNote':
        this.setState({
          bibleListOptionIconUri: require('assets/ic_option_list_off.png'),
          bibleNoteOptionIconUri: require('assets/ic_option_note_on.png'),
          fontChangeOptionIconUri: require('assets/ic_option_font_off.png'),
          optionComponentState: 'bibleNote',
        });
        break;
      case 'fontChange':
        this.setState({
          bibleListOptionIconUri: require('assets/ic_option_list_off.png'),
          bibleNoteOptionIconUri: require('assets/ic_option_note_off.png'),
          fontChangeOptionIconUri: require('assets/ic_option_font_on.png'),
          optionComponentState: 'fontChange',
        });
        break;
    }
  };

  // 각 옵션에 대한 컴포넌트를 화면에 그려주는 메서드.
  showOptionComponent() {
    let visibleOptionComponent;
    switch (this.state.optionComponentState) {
      case 'bibleList':
        visibleOptionComponent = <BibleListOption/>;
        break;
      case 'bibleNote':
        visibleOptionComponent = <BibleNoteOption/>;
        break;
      case 'fontChange':
        visibleOptionComponent = <FontChangeOption/>;
        break;
    }
    return visibleOptionComponent;
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal
          style={styles.modal}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  this.setModalVisible(false, 'copy');
                }}>
                <Text style={styles.modalItemText}>복사</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  this.setModalVisible(false, 'highlight');
                }}>
                <Text style={styles.modalItemText}>형광펜</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  this.setModalVisible(false, 'memo');
                }}>
                <Text style={styles.modalItemText}>메모</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  this.setModalVisible(false);
                }}>
                <Text style={styles.modalItemText}>취소</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FlatList
          style={styles.flatList}
          data={this.state.verseItems}
          keyExtractor={item => item.id}
          ref={(ref) => {this.flatListRef = ref;}}
          renderItem={({item, index}) => {
            let verseCode = index + 1;
            return (
              <TouchableOpacity style={styles.flatListItem} onLongPress={this.onLongPressButton(item)}>
                <Text style={styles.flatListItemText}>{verseCode}.    {item.content}</Text>
              </TouchableOpacity>
            )
          }}
        />

        <View style={styles.footerOptionContainer}>
          <TouchableOpacity style={styles.footerOptionContainerItem} onPress={this.onClickOptionButton('bibleList')}>
            <Image style={styles.footerOptionIcon} source={this.state.bibleListOptionIconUri} />
            <Text>목차</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerOptionContainerItem} onPress={this.onClickOptionButton('bibleNote')}>
            <Image style={styles.footerOptionIcon} source={this.state.bibleNoteOptionIconUri} />
            <Text>성경노트</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerOptionContainerItem} onPress={this.onClickOptionButton('fontChange')}>
            <Image style={styles.footerOptionIcon} source={this.state.fontChangeOptionIconUri} />
            <Text>보기설정</Text>
          </TouchableOpacity>
        </View>

        {this.showOptionComponent()}
      </View>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: 'white',

  },

  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15
  },
  flatList: {

  },

  flatListItem: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 2,
    paddingRight: 2,

  },

  flatListItemText: {
    color: 'black'
  },

  modal: {
    borderWidth: 1,
    borderColor: 'red',
  },

  modalContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  modalView: {
    width: 200,
    height: 150,
    borderWidth: 1,
    borderColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#AEAEAE'
  },

  modalItem: {

  },

  modalItemText: {
    color: 'white',
    fontSize: 15
  },

  footerOptionContainer: {
    borderWidth: 1,
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: '5%',
    width: '100%',
    height: 70,
    borderRadius: 5,
    backgroundColor: 'white',
    justifyContent: 'space-around',
    flexDirection: 'row'
  },

  footerOptionContainerItem: {
    width: '30%',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },

  footerOptionIcon: {
    width: 40,
    height: 30,
    resizeMode: 'contain',
  },
});
