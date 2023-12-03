<?php
header("Access-Control-Allow-Origin: *");
$files = array_diff(scandir('./veggies'), ['.', '..']);
$getContentAsJson = function($file) {
  return json_decode(file_get_contents('./veggies/'.$file));
};
$fileContents = array_map($getContentAsJson, $files);
echo json_encode(array_values($fileContents));
?>