import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList

} from 'react-native';

import {getSqliteDatabase} from '/utils'

export default class ChapterListScreen extends Component {
  state = {
    chapterItems: [],
  };

  componentDidMount() {
    const { route } = this.props;
    const {bookName, bookCode} = route.params;

    // 성경의 장을 모두 가져오는 쿼리를 수행.
    getSqliteDatabase().transaction((tx) => {
      const query = `SELECT max(chapter) as count FROM bible_korHRV where book = ${bookCode}`;
      console.log(query);
      tx.executeSql(query, [], (tx, results) => {
        let chapterItemsLength = results.rows.item(0).count;
        const chapterItems = [];
        /**
         * Item insert
         */
        for (let i = 0; i < chapterItemsLength ; i++) {
          chapterItems.push(
            {
              bookCode,
              bookName,
            })
        }
        this.setState({chapterItems});
      })
    })
  }

  goToChapterListScreen = (bookInfo) => {
    this.props.navigation.navigate('VerseListScreen',
      {
        bookName: bookInfo.bookName,
        bookCode: bookInfo.bookCode,
        chapterCode: bookInfo.chapterCode,
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.titleText}>장을 선택해주세요.</Text>
        <FlatList
          style={styles.flatList}
          data={this.state.chapterItems}
          keyExtractor={(item, index) => item +index }
          renderItem={({item, index}) => {
            let chapterCode = index + 1;
            return (
              <TouchableOpacity
                style={styles.flatListItem}
                onPress={this.goToChapterListScreen.bind(this,
                  {
                    bookName: item.bookName,
                    bookCode: item.bookCode,
                    chapterCode: chapterCode,
                  })}>
                  <Text style={styles.flatListItemText}>{chapterCode}.    {item.bookName}{chapterCode}장</Text>
              </TouchableOpacity>
              )
          }}
        />
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
    backgroundColor: 'white'
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15
  },
  flatList: {

  },
  flatListItem: {
    height: 57,
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'column',
    paddingTop: 30,
    paddingBottom: 30,
    paddingLeft: 2,
    paddingRight: 2,
    borderBottomColor: '#AABBCC',
    borderBottomWidth: 1,
  },
  flatListItemText: {
    color: 'black'
  }
});
