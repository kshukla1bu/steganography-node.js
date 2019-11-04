<!DOCTYPE html>
<html>
<body>
{{#error}}<h4>Error Occurred:</h4><h5>{{error}}</h5><br><a href='/hide'>Go Back</a>{{/error}}
<form action="/hSuccess" method="post" enctype="multipart/form-data">
	{{#imgList}}
  <input type="radio" name="img" value={{imgUrl}}> <img src={{imgUrl}} width="100">    {{imgName}}<br>

{{/imgList}}<br>
  <input type="file" name="msg" >   Enter an Message File Path<br>
  <textarea name="msg" rows="5" cols="70"></textarea>   Enter a message to hide<br>
  <input type="submit" value="Hide">
</form>
 
</body>
</html>
