<?php

function renderContent($request, $error) {
  if (!$_SESSION['isValidUser']) {
    return $error . '<h1>Login-Formular</h1>';
  }
  if (file_exists('../templates/content/' . $request . '.html')) {
    return file_get_contents('../templates/content/' . $request . '.html');
  }
  return 'Page not found!';
}

function renderNav($request, $user) {
  $nav = $user['isValid']
    ? '<li class="header__navLi">
    <a href="/planning">Planung</a>
  </li>
  <li class="header__navLi">
    <a href="/reports">Auswertungen</a>
  </li>
  <li class="header__navLi">
    <a href="/config">Konfiguration</a>
  </li>
  <li class="header__navLi">
    <a href="/logout">Logout</a>
  </li>'
    : '<li class="header__navLi">
    <a href="/login">Login</a>
  </li>';
  return $nav;
}

function renderScript($request, $user) {
  if ($request == 'planning' && $user['isValid']) {
    return '<script src="js/planning.mjs" type="module"></script>';
  } else {
    return '';
  }
}

function renderPage($request, $error, $user) {
  $page = file_get_contents('../templates/page.html');
  $nav = renderNav($request, $user);
  $content = renderContent($request, $error);
  $script = renderScript($request, $user);

  $page = preg_replace('/\[\%nav\%\]/', $nav, $page);
  $page = preg_replace('/\[\%content\%\]/', $content, $page);
  $page = preg_replace('/\[\%script\%\]/', $script, $page);

  return $page;
}

?>
