<!DOCTYPE html>
<html>
<body>
{{#error}}<h4>Error Occurred:</h4><h5>{{error}}</h5><br><a href='/unhide'>Go Back</a>{{/error}}
<form action="/uSuccess" method="post">
{{#imgOList}}	
  <input type="radio" name="img" value={{imgOUrl}}> <img src={{imgOUrl}} width="100">    {{imgOName}}<br>

{{/imgOList}} <br>
  <input type="submit" value="UnHide">
</form>

</body>
</html>
