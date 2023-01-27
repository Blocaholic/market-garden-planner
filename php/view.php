<?php

function renderContent($target, $error) {
  if(!$_SESSION['isValidUser']) {
    return $error.'<h2>Login-Formular</h2>';
  }
  if($target == 'boxes') {
    return '<h2>Kistenplanung</h2>';
  }
  if($target == 'reports') {
    return '<h2>Auswertungen</h2><img src="/images/logo.svg">';
  }
  if($target == 'home') {
    return '<h2>Welcome home</h2>';
  }
  return 'Page not found!';
  $content = '<h2>Überschrift</h2>
  <h3>Überschrift</h3>
  <h4>Überschrift</h4>
  <p>Text</p>';
}

function renderNav($target, $user) {
  $nav = ($user["isValid"]) ?
  '<li class="header__mainNavLi header__mainNavLi--active">
    <a href="?target=boxes">Kisten</a>
  </li>
  <li class="header__mainNavLi">
    <a href="?target=reports">Reports</a>
  </li>
  <li class="header__mainNavLi">
    <a href="?target=logout">Logout</a>
  </li>':
  '<li class="header__mainNavLi">
    <a href="?target=login">Login</a>
  </li>';
  return $nav;
}

function renderPage($target, $error, $user) {
  
  $page = file_get_contents("../templates/page.html");
  $nav = renderNav($target, $user);
  $content = renderContent($target, $error);

  $page = preg_replace("/\[\%nav\%\]/", $nav, $page);
  $page = preg_replace("/\[\%content\%\]/", $content, $page);
  
  return $page;
}

?>