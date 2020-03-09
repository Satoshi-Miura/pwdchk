# pwdchk
このツールはパスワード強度をチェックします(This tool check password strength)

セットアップ setup  
  
このpwdchkディレクトリをApacheのhtdocディレクトリにコピーします。  
Copy this pwdchk directory to Apache's htdoc directory.  
するとWebブラウザで表示できます。  
Then you can display it with a web browser.  

動作 behaivor  
  
入力されたパスワードから次の事項を考慮してパスワード強度を計算します。  
Calculates the password strength from the entered password considering the following:  
  
- 長さが10文字以上か？   Is it more than 10 characters long?  
- 数字を含むか？         Does it contains a number?  
- 英小文字を含むか？     Does it contain lowercase letters?  
- 英大文字を含むか？     Does it contain uppercase letters?  
- 記号を含むか？       Does it contain symbols?  
- 重複・連続していないか(111, abc, 987など)?  Is it overlapping or repeating?  
- メールアドレスや安易なキーワード(adminなど)を含んでいないか?  Does it contain email addresses or easy keywords?  
  
判定  Judgement result    
- とても強い(合格)       very-strong(pass)   (81~100%)  
- 強い(合格)            strong(pass)        (61~80%)  
- やや弱い(合格)        average(pass)       (41~60%)  
- 弱い(不合格)           weak(fail)          (21~40%)  
- とても弱い(不合格)      very-weak(fail)     (0~20%)  
- 未入力               empty          (N/A)  

独自のNGワードを追加するなら js/jquery.pwdMeasure.js の 236行目にNGワードを追加して下さい。  
To add your own NG word, add it on line 236 of js/jquery.pwdMeasure.js.

このコードは、[wadackel/jquery-pwd-measure](https://github.com/wadackel/jquery-pwd-measure) を流用しました。ありがとうtsuyoshi wada。  
This code used [wadackel/jquery-pwd-measure](https://github.com/wadackel/jquery-pwd-measure).Thanks tsuyoshi wada.
