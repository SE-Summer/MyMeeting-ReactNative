package com.mymeeting_react_native;

import com.facebook.react.ReactActivity;
import com.rnfs.RNFSPackage;
import java.util.List;
import java.util.Arrays;
import com.facebook.react.ReactPackage;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "MyMeeting_React_Native";
  }

//  @Override
  protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
//            new MainReactPackage(), // <---- add comma
            new RNFSPackage() // <---------- add package
    );
  }
}
