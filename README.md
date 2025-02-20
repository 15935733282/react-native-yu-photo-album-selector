# react-native-yu-photo-album-selector
react-native的照片选择组件

## 安装

### npm
```
npm install react-native-yu-photo-album-selector --save
```

### yarn
```
yarn add react-native-yu-photo-album-selector
```

### IOS
在ios目录下执行pod install
```
pod install
```

### Android
rn版本>=0.75.4无需额外配置

### 权限

#### IOS
在运行 iOS 10 或更高版本的设备上，需要获得用户的许可才能访问相机胶卷。NSPhotoLibraryUsageDescription在您的应用程序中添加Info.plist一个字符串，描述您的应用程序将如何使用这些数据。此密钥将显示为 Xcode 中的密钥Privacy - Photo Library Usage Description。

如果您的目标设备运行的是 iOS 11 或更高版本，您还需要NSPhotoLibraryAddUsageDescription在 中添加密钥Info.plist。使用此密钥定义一个字符串，描述您的应用将如何使用这些数据。通过将此密钥添加到Info.plist，您将能够向用户请求只写访问权限。如果您尝试在没有此权限的情况下保存到相机胶卷，您的应用将退出。

#### Android
需要权限才能读取和写入外部存储。
在AndroidManifest.xml中添加以下权限：
```
 <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
  <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

## 使用
```
import {PhotoAlbumSelector} from 'react-native-yu-photo-album-selector';

type DemoType = {};

const Demo: FC<DemoType> = () => {
 
  return (
    <View style={styles.container}>
      <PhotoAlbumSelector onConfirm={(photoIdentifiers  )=>{
        console.log('选择了相册',photoIdentifiers);
      }} >
        <View>
        <Text>选择相册</Text>
        </View>
      </PhotoAlbumSelector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    padding: 20,
  },
});

export default Demo;
```

## props

| 属性名       | 类型                                            | 必填 | 默认值  | 描述     |
|-----------|-----------------------------------------------|----|------|--------|
| onConfirm | (photoIdentifiers: PhotoIdentifier[]) => void | 否  | null | 确定回调函数 |
| children  | ReactNode                                     | 否  | null | 自定义内容  |


