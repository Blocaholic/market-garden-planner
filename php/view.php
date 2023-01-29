<?php

function renderContent($target, $error) {
  if(!$_SESSION['isValidUser']) {
    return $error.'<h2>Login-Formular</h2>';
  }
  if(file_exists('../templates/content/'.$target.'.html')) {
    return file_get_contents("../templates/content/".$target.".html");
  }
  return 'Page not found!';
}

function renderNav($target, $user) {
  $nav = ($user["isValid"]) ?
  '<li class="header__navLi">
    <a href="?target=boxes">Kisten</a>
  </li>
  <li class="header__navLi">
    <a href="?target=logout">Logout</a>
  </li>':
  '<li class="header__navLi">
    <a href="?target=login">Login</a>
  </li>';
  return $nav;
}

function renderScript($target, $user) {
  if ($target == 'boxes' && $user["isValid"]) {
    return '<script src="js/boxes.mjs" type="module"></script>';
  }
  else {
    return '';
  }
}

function renderPage($target, $error, $user) {
  
  $page = file_get_contents("../templates/page.html");
  $nav = renderNav($target, $user);
  $content = renderContent($target, $error);
  $script = renderScript($target, $user);

  $page = preg_replace("/\[\%nav\%\]/", $nav, $page);
  $page = preg_replace("/\[\%content\%\]/", $content, $page);
  $page = preg_replace("/\[\%script\%\]/", $script, $page);
  
  return $page;
}

?>