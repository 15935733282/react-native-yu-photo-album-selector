import React, {FC, ReactNode, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  CameraRoll,
  PhotoIdentifier,
} from '@react-native-camera-roll/camera-roll';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

// @ts-ignore
import CloseWhiteIcon from './icon/close_white.png';

export type PhotoAlbumSelectorType = {
  /**
   * 确定回调函数
   * @param photoIdentifiers
   */
  onConfirm?: (photoIdentifiers: PhotoIdentifier[]) => void;
  children?: ReactNode;
};

async function hasAndroidPermission() {
  const getCheckPermissionPromise = async () => {
    // @ts-ignore
    if (Platform.Version >= 33) {
      const [hasReadMediaImagesPermission, hasReadMediaVideoPermission] =
        await Promise.all([
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          ),
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ),
        ]);
      return hasReadMediaImagesPermission && hasReadMediaVideoPermission;
    } else {
      return PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
    }
  };

  const hasPermission = await getCheckPermissionPromise();
  if (hasPermission) {
    return true;
  }
  const getRequestPermissionPromise = async () => {
    // @ts-ignore
    if (Platform.Version >= 33) {
      const statuses = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      ]);
      return (
        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
          PermissionsAndroid.RESULTS.GRANTED
      );
    } else {
      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      );
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  return await getRequestPermissionPromise();
}

const {width} = Dimensions.get('window'); // 获取屏幕宽度

const PhotoAlbumSelector: FC<PhotoAlbumSelectorType> = ({
  onConfirm,
  children,
}) => {
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [visiblePreview, setVisiblePreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [images, setImages] = useState<PhotoIdentifier[]>([]);
  const endCursor = useRef<string | undefined>(undefined);
  const isEnd = useRef<boolean>(false);

  const [selectIndexArr, setSelectIndexArr] = useState<number[]>([]);

  const _handleButtonPress = async () => {
    if (isEnd.current) {
      return;
    }
    const photosData = await CameraRoll.getPhotos({
      first: 40, // 获取前40张照片
      after: endCursor.current, // 从上一次请求的最后一张照片开始获取
      assetType: 'Photos', // 只获取图片
    });
    setImages(prevState => [...prevState, ...photosData.edges]);
    if (!photosData.page_info.has_next_page) {
      isEnd.current = true;
    }
    endCursor.current = photosData.page_info.end_cursor;
    setVisible(true);
  };

  const init = async () => {
    if (Platform.OS === 'android') {
      await hasAndroidPermission();
    }
    endCursor.current = undefined;
    setImages([]);
    await _handleButtonPress();
  };

  const _close = () => {
    isEnd.current = false;
    setVisible(false);
    setVisiblePreview(false);
  };

  const _previewClose = () => {
    setVisiblePreview(false);
  };

  const SelectButton: (index: number) => React.JSX.Element = (
    index: number,
  ) => {
    return (
      <Pressable
        onPress={() => {
          console.log(selectIndexArr, index);
          let currentSelectIndex = selectIndexArr.findIndex(
            _index => _index === index,
          );
          if (currentSelectIndex !== -1) {
            selectIndexArr.splice(currentSelectIndex, 1);
          } else {
            selectIndexArr.push(index);
          }
          setSelectIndexArr([...selectIndexArr]);
        }}>
        <View style={{padding: 5}}>
          {selectIndexArr.includes(index) ? (
            <View style={styles.selected}>
              <Text style={{fontSize: 12, color: '#FFFFFF'}}>
                {selectIndexArr.findIndex(_index => _index === index) + 1}
              </Text>
            </View>
          ) : (
            <View style={styles.select}></View>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={init}>
        <View>{children}</View>
      </Pressable>
      <Modal
        statusBarTranslucent={true}
        visible={visible}
        onRequestClose={_close}>
        <View
          style={[
            styles.modalContainer,
            {
              paddingTop: insets.top + 5,
            },
          ]}>
          <View style={styles.headerContainer}>
            <View style={[styles.headerItem, {paddingLeft: 20}]}>
              <Pressable onPress={_close}>
                <Image
                  source={CloseWhiteIcon}
                  style={{width: 20, height: 20}}
                />
              </Pressable>
            </View>
            <View style={[styles.headerItem, {alignItems: 'center'}]}>
              <Text style={styles.text}>相册</Text>
            </View>
            <View style={[styles.headerItem, {alignItems: 'center'}]}></View>
          </View>
          <FlatList
            numColumns={4}
            showsVerticalScrollIndicator={false}
            data={images}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({item, index}: any) => (
              <View key={`${index}`} style={styles.selectImageItemContainer}>
                <View style={[styles.selectContainer]}>
                  {SelectButton(index)}
                </View>

                <Pressable
                  onPress={() => {
                    setPreviewIndex(index);
                    setVisiblePreview(true);
                  }}>
                  <Image style={styles.selectImage} src={item.node.image.uri} />
                </Pressable>
              </View>
            )}
            onEndReached={_handleButtonPress}
          />

          <View style={styles.footerContainer}>
            <View style={styles.footerItem}>
              <Pressable onPress={() => setVisiblePreview(true)}>
                <Text style={styles.text}>
                  预览({selectIndexArr.length})
                </Text>
              </Pressable>
            </View>
            <View style={[styles.footerItem, {alignItems: 'flex-end'}]}>
              <Pressable
                onPress={() => {
                  let photoIdentifiers = selectIndexArr.map(_ => images[_]);
                  onConfirm?.(photoIdentifiers);
                }}>
                <Text style={styles.text}>完成</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Modal
          visible={visiblePreview}
          statusBarTranslucent={true}
          onRequestClose={_previewClose}>
          <View
            style={[
              styles.modalContainer,
              styles.previewContainer,
              {paddingTop: insets.top + 5}
            ]}>
            <View style={[styles.headerContainer]}>
              <View style={[styles.headerItem, {paddingLeft: 20}]}>
                <Pressable onPress={_previewClose}>
                  <Image
                    source={CloseWhiteIcon}
                    style={{width: 20, height: 20}}
                  />
                </Pressable>
              </View>
              <View style={[styles.headerItem, {alignItems: 'center'}]}>
                <Text style={styles.text}>预览</Text>
              </View>
              <View
                style={[
                  styles.headerItem,
                  {
                    alignItems: 'flex-end',
                    paddingRight: 20,
                  },
                ]}>
                {SelectButton(previewIndex)}
              </View>
            </View>
            <View style={{flex: 1, backgroundColor: '#000000'}}>
              <FlatList
                data={images}
                horizontal
                renderItem={({item, index}) => (
                  <View style={styles.previewItem} key={index}>
                    <Image
                      src={item.node.image.uri}
                      style={{
                        width: '100%',
                        height: '100%',
                        resizeMode: 'contain',
                      }}
                    />
                  </View>
                )}
                keyExtractor={(item, index) => index.toString()}
                showsHorizontalScrollIndicator={false}
                snapToInterval={width} // 设置滑动的间隔
                decelerationRate="fast" // 控制滑动的速度
                onViewableItemsChanged={({viewableItems}) => {
                  if (viewableItems.length > 0) {
                    const index = viewableItems[0].index;
                    if (typeof index === 'number' && index !== previewIndex) {
                      setPreviewIndex(index);
                    }
                  }
                }}
                initialScrollIndex={previewIndex}
                // 无限循环的效果
                getItemLayout={(data, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
              />
            </View>
            <View style={[styles.footerContainer]}>
              <View style={styles.footerItem}>

              </View>
              <View style={[styles.footerItem, {alignItems: 'flex-end'}]}>
                <Pressable
                    onPress={_previewClose}>
                  <Text style={styles.text}>完成</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  text:{
    fontSize: 16,
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  selectImageItemContainer: {width: '25%', padding: 1},
  selectImage: {width: '100%', aspectRatio: 1, borderRadius: 2},
  selectContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
  },
  select: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  selected: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF4D4F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    justifyContent: 'center',
  },
  previewItem: {
    flex: 1,
    width: width, // 设置每个项目的宽度
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 45,
  },
  headerItem: {
    width: '33.33%',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  footerItem: {
    width: '33.33%',
  }
});

export default PhotoAlbumSelector;
