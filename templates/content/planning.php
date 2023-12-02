<h1>Gemüsekisten</h1>
<p>100 Abonnenten</p>
<div id="boxes__wrapper"
     class="boxes__wrapper">
</div>
<div class="addBoxes__wrapper"
     id="addBoxes__wrapper">
  <h3 id="addBoxes__h3"
      class="addBoxes__h3">Serie planen
    <span class="__closeSymbol"
          id="addBoxes__close">&#65291;</span>
  </h3>
  <div class="addBoxes__inputWrapper"
       id="addBoxes__inputWrapper">
    <label for="addBoxes__firstDay">Erste Gemüsekiste</label>
    <input type="date"
           name="addBoxes__firstDay"
           id="addBoxes__firstDay">
    <label for="addBoxes__lastDay">Letzte Gemüsekiste</label>
    <input type="date"
           name="addBoxes__lastDay"
           id="addBoxes__lastDay">
    <label for="addBoxes__interval">Intervall</label>
    <select name="addBoxes__interval"
            id="addBoxes__interval">
      <option value="7">wöchentlich</option>
      <option value="14">2-wöchig</option>
      <option value="21">3-wöchig</option>
      <option value="28">4-wöchig</option>
    </select>
  </div>
  <div class="addBoxes__dates"
       id="addBoxes__dates"></div>
  <a href="#"
     id="addBoxes__save"
     class="button">0 Kisten Hinzufügen</a>
</div>
<div class="addBox__wrapper"
     id="addBox__wrapper">
  <h3 id="addBox__h3"
      class="addBox__h3">Kiste hinzufügen
    <span class="__closeSymbol"
          id="addBox__close">&#65291;</span>
  </h3>
  <div class="addBox__inputWrapper"
       id="addBox__inputWrapper">
    <label for="addBox__year"
           id="addBox__yearLabel">Jahr</label>
    <select name="addBox__year"
            id="addBox__year">
    </select>
    <label for="addBox__date"
           id="addBox__dateLabel">Datum</label>
    <select name="addBox__date"
            id="addBox__date">
    </select>
  </div>
  <a href="#"
     id="addBox__save"
     class="button">1 Kiste hinzufügen</a>
</div>
<hr>

<h1>Markttage</h1>
<div id="marketDays__wrapper"
     class="marketDays__wrapper">
</div>
<div class="addMarketDays__wrapper"
     id="addMarketDays__wrapper">
  <h3 id="addMarketDays__h3"
      class="addMarketDays__h3">Serie planen
    <span class="__closeSymbol"
          id="addMarketDays__close">&#65291;</span>
  </h3>
  <div class="addMarketDays__inputWrapper"
       id="addMarketDays__inputWrapper">
    <label for="addMarketDays__firstDay">Erster Markttag</label>
    <input type="date"
           name="addMarketDays__firstDay"
           id="addMarketDays__firstDay">
    <label for="addMarketDays__lastDay">Letzter Markttag</label>
    <input type="date"
           name="addMarketDays__lastDay"
           id="addMarketDays__lastDay">
    <label for="addMarketDays__interval">Intervall</label>
    <select name="addMarketDays__interval"
            id="addMarketDays__interval">
      <option value="7">wöchentlich</option>
      <option value="14">2-wöchig</option>
      <option value="21">3-wöchig</option>
      <option value="28">4-wöchig</option>
    </select>
  </div>
  <div class="addMarketDays__dates"
       id="addMarketDays__dates"></div>
  <a href="#"
     id="addMarketDays__save"
     class="button">0 Markttage hinzufügen</a>
</div>

<div class="addMarketDay__wrapper"
     id="addMarketDay__wrapper">
  <h3 id="addMarketDay__h3"
      class="addMarketDay__h3">Markttag hinzufügen
    <span class="__closeSymbol"
          id="addMarketDay__close">&#65291;</span>
  </h3>
  <div class="addMarketDay__inputWrapper"
       id="addMarketDay__inputWrapper">
    <label for="addMarketDay__year"
           id="addMarketDay__yearLabel">Jahr</label>
    <select name="addMarketDay__year"
            id="addMarketDay__year">
    </select>
    <label for="addMarketDay__date"
           id="addMarketDay__dateLabel">Datum</label>
    <select name="addMarketDay__date"
            id="addMarketDay__date">
    </select>
  </div>
  <a href="#"
     id="addMarketDay__save"
     class="button">1 Markttag hinzufügen</a>
</div>
<hr>

<h1>Aussaaten</h1>
<div class="addSowing"
     id="addSowing">
  <span class="__closeSymbol"
        id="addSowing__close">&#65291;</span>
  <div id="addSowing__veggieWrapper">
    <h2 id="addSowing__veggieName"
        class="addSowing__veggieName"></h2>
    <select name="addSowing__culture"
            id="addSowing__culture"></select>
    <select name="addSowing__variety"
            id="addSowing__variety"></select>
  </div>
  <div id="addSowing__dateWrapper">Aussaat-Datum:
    <span id="addSowing__date"></span>
  </div>
  <div id="addSowing__firstCropDateWrapper">Erster Ernte-Termin:
    <span id="addSowing__firstCropDate"></span>
  </div>
  <table id="addSowing__requirements"
         class="addSowing__requirements">
    <tr id="addSowing__requirementsHeader">
      <td></td>
      <td>Bedarf</td>
      <td>Vorgabe</td>
      <td></td>
    </tr>
    <tr id="addSowing__seedAmount">
      <td>Aussaat-Menge</td>
      <td id="addSowing__seedAmount--required">0</td>
      <td><input type="text"
               name="addSowing__seedAmount--given"
               id="addSowing__seedAmount--given"
               value="0"></td>
      <td>Samen</td>
    </tr>
    <tr id="addSowing__bedLength">
      <td>Beet-Länge</td>
      <td id="addSowing__bedLength--required">0</td>
      <td><input type="text"
               name="addSowing__bedLength--given"
               id="addSowing__bedLength--given"
               value="0"></td>
      <td>m</td>
    </tr>
    <tr id="addSowing__quickpot">
      <td>Quickpots</td>
      <td id="addSowing__quickpotAmount--required">0</td>
      <td><input type="text"
               name="addSowing__quickpotAmount--given"
               id="addSowing__quickpotAmount--given"
               value="0"></td>
      <td id="addSowing__quickpotSize"></td>
    </tr>
    <tr id="addSowing__cropAmount">
      <td>Ernte pro Tag</td>
      <td id="addSowing__cropAmount--required">0</td>
      <td><input type="text"
               name="addSowing__cropAmount--given"
               id="addSowing__cropAmount--given"
               value="0"></td>
      <td class="addSowing__harvestUnit"></td>
    </tr>
    <tr id="addSowing__totalCropAmount">
      <td>Ernte gesamt</td>
      <td id="addSowing__totalCropAmount--required">0</td>
      <td><input type="text"
               name="addSowing__totalCropAmount--given"
               id="addSowing__totalCropAmount--given"
               value="0"></td>
      <td class="addSowing__harvestUnit"></td>
    </tr>
  </table>
  <div id="quickpots"
       class="quickpots">
  </div>
  <table class="addSowing__crops"
         id="addSowing__crops">
  </table>
  <a href="#"
     class="button"
     id="addSowing__reset">Reset</a>
  <a href="#"
     class="button button--attention"
     id="addSowing__save">Speichern</a>
</div>
<code id="sowings"></code>
