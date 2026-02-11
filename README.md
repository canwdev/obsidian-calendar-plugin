# obsidian-calendar-plugin

This plugin for [Obsidian](https://obsidian.md/) creates a simple Calendar view for visualizing and navigating between your daily notes.

![screenshot-full](https://raw.githubusercontent.com/liamcain/obsidian-calendar-plugin/master/images/screenshot-full.png)

## Usage

After enabling the plugin in the settings menu, you should see the calendar view appear in the right sidebar.

The plugin reads your Daily Note settings to know your date format, your daily note template location, and the location for new daily notes it creates.

## Features

- Go to any **daily note**.
- Create new daily notes for days that don't have one. (This is helpful for when you need to backfill old notes or if you're planning ahead for future notes! This will use your current **daily note** template!)
- Visualize your writing. Each day includes a meter to approximate how much you've written that day.
- Use **Weekly notes** for an added organization layer! They work just like daily notes, but have their own customization options.

## Settings

- **Start week on [default: locale]**: Configure the Calendar view to show Sunday or Monday as the first day of the week. Choosing 'locale' will set the start day to be whatever is the default for your chosen locale (`Settings > About > Language`)
- **Words per Dot [default: 250]**: Starting in version 1.3, dots reflect the word count of your files. By default, each dot represents 250 words, you can change that value to whatever you want. Set this to `0` to disable the word count entirely. **Note:** There is a max of 5 dots so that the view doesn't get too big!
- **Confirm before creating new note [default: on]**: If you don't like that a modal prompts you before creating a new daily note, you can turn it off.
- **Show Week Number [default: off]**: Enable this to add a new column to the calendar view showing the [Week Number](https://en.wikipedia.org/wiki/Week#Week_numbering). Clicking on these cells will open your **weekly note**.

## Compatibility

`obsidian-calendar-plugin` currently requires Obsidian v0.9.11 or above to work properly.

## Installation

You can install the plugin via the Community Plugins tab within Obsidian. Just search for "Calendar."

## Development (React + Vite + Bun)

This is the React reimplementation of the calendar plugin.

- Install: `bun install`
- Build: `bun run build`
- Output: `main.js`, `styles.css`, `manifest.json`, `versions.json`
