# Capture Shield

Плагин для [Obsidian](https://obsidian.md), который делает окно **невидимым для программ захвата экрана** (Zoom, Microsoft Teams, Google Meet, Discord, OBS, встроенная запись Windows) и одновременно убирает Obsidian с **панели задач** и из **Alt+Tab**. Никто на той стороне созвона или в записи не увидит, что Obsidian вообще запущен.

Полезно для:
- стримов и записи туториалов, где не хочется светить личные заметки;
- презентаций с приватными speaker notes;
- демонстрации экрана с конфиденциальными данными;
- просто приватности при шеринге экрана.

## Как это работает

Под капотом — два системных вызова:

- **`setContentProtection(true)`** — на Windows вызывает `SetWindowDisplayAffinity(WDA_EXCLUDEFROMCAPTURE)`. Это enforced на уровне DWM, то есть Zoom/OBS/Teams физически не могут захватить пиксели окна, что бы они ни делали. На macOS — `NSWindow.sharingType = NSWindowSharingNone`.
- **`setSkipTaskbar(true)`** — убирает иконку с панели задач Windows и из Alt+Tab.

## Установка

### Вариант 1: вручную

1. Скачай файлы `manifest.json` и `main.js` из этого репозитория (или клонируй репу целиком).
2. В своём Obsidian-волте перейди в папку `<vault>/.obsidian/plugins/`. Если папки `plugins` нет — создай.
3. Внутри `plugins/` создай папку `capture-shield/` и положи туда оба файла.
4. Перезапусти Obsidian (или **Settings → Community plugins → Reload plugins**).
5. **Settings → Community plugins** → если стоит Restricted mode, нажми **Turn on community plugins**.
6. В списке Installed plugins включи **Capture Shield**.

## Как пользоваться

Включить/выключить можно тремя способами:

- **Иконка в ribbon** (левая боковая панель) — глаз с перечёркиванием.
- **Статус-бар** внизу справа: `Shield: off` / `Shield: ON`. Клик переключает.
- **Command palette** (`Ctrl+P`):
  - `Toggle hide (capture + taskbar)` — включить/выключить.
  - `Restore / focus Obsidian window` — вернуть окно (см. ниже).

На любую команду можно повесить свой хоткей в **Settings → Hotkeys**.

Состояние сохраняется между запусками Obsidian.

## Как вернуть окно Obsidian, если оно «исчезло»

Когда Shield включён, Obsidian **не показывается в Alt+Tab и нет иконки на панели задач**. Если ты случайно свернул окно или переключился в другое приложение — обычными способами Obsidian не найдёшь.

Плагин регистрирует **глобальный системный хоткей**:

> ### `Ctrl + Shift + Alt + O`

Жми его в любом приложении — окно Obsidian вылезет поверх всех. Альтернатива: открой Run (`Win+R`), набери `obsidian://open` — тоже поднимет окно.

Если хоткей конфликтует с чем-то другим (например, у тебя AutoHotkey что-то на нём висит), скажи — поменяю в коде.

## Проверка, что работает

1. Включи Shield (иконка в ribbon или клик по `Shield: off` в статус-баре). Должна выскочить плашка `Capture Shield: HIDDEN. Restore: Control+Shift+Alt+O`.
2. **Иконка Obsidian должна пропасть с панели задач Windows.**
3. Жми `Alt+Tab` — Obsidian не должен быть в списке.
4. Открой Zoom → Share Screen → Screen. В превью окно Obsidian должно стать чёрным прямоугольником или исчезнуть.
5. Для проверки в OBS: добавь Display Capture или Window Capture → Obsidian не должен попадать в кадр. **Важно:** в свойствах источника **Method** должен быть `Windows 10 (WGC)` или `DXGI`, не `BitBlt` — старый BitBlt игнорирует флаг.
6. Если потерял окно — нажми `Ctrl+Shift+Alt+O`.

## Ограничения

- **Windows 10 версии до 2004 (билд 19041).** В старых версиях `WDA_EXCLUDEFROMCAPTURE` нет — флаг откатывается в `WDA_MONITOR`, и окно становится чёрным **на твоём собственном экране** тоже. Решается обновлением Windows.
- **macOS со свежими версиями Zoom/Teams.** Если приложение перешло на `ScreenCaptureKit`, оно может захватывать окна вопреки `setContentProtection`. На Windows такой проблемы нет — DWM-флаг обойти штатно невозможно.
- **Task Manager (`Ctrl+Shift+Esc`)** всё равно покажет процесс `Obsidian.exe` — это уровень ядра, из приложения замаскировать нельзя. Если критично — переименуй `Obsidian.exe` во что-то нейтральное в папке установки.
- **Физическая камера, направленная на монитор**, или **HDMI-сплиттер/карта захвата** — это железо, программный флаг им не указ.

## Известные сценарии

| Программа | Захватывает Obsidian с Shield? |
|---|---|
| Zoom (Share Screen) | Нет |
| Microsoft Teams | Нет |
| Google Meet (Chrome) | Нет |
| Discord (Stream / Screen Share) | Нет |
| OBS — Display Capture (WGC/DXGI) | Нет |
| OBS — Display Capture (BitBlt, legacy) | Да |
| Windows Game Bar (`Win+G`) запись | Нет |
| Снипер `Win+Shift+S` | Нет |
| Print Screen | Зависит от версии Windows; на 19041+ — нет |
| Камера на экране | Да (это не лечится софтом) |

## Лицензия

Под MIT, делай что хочешь.
