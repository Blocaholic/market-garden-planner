<?php

function renderContent($request, $error) {
  if (!$_SESSION['isValidUser']) {
    if (!in_array($request, ['signup', 'signin'])) {
      return $error . file_get_contents('../templates/content/signin.html');
    }
  }
  if (file_exists('../templates/content/' . $request . '.html')) {
    return $error .
      file_get_contents('../templates/content/' . $request . '.html');
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
  </li>
  <li class="header__navLi">
    <a href="/signup">Registrieren</a>
  </li>';
  return $nav;
}

function renderScript($request, $user) {
  if ($request == 'planning' && $user['isValid']) {
    return '<script src="js/planning.mjs" type="module"></script>';
  } elseif ($request == 'report-1' && $user['isValid']) {
    return '<script src="js/report-1.mjs" type="module"></script>';
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
