---
name: configuring-neovim
description: Provides Neovim and Vim configuration patterns for plugins, keymaps, LSP setup, and Treesitter queries. Use PROACTIVELY when editing Neovim config files, init.lua, plugin configurations, or vim scripts.
---

# Neovim/Vim Configuration

## Contents

- [Core Neovim Lua API](#core-neovim-lua-api)
- [Plugin Management (lazy.nvim)](#plugin-management-lazynvim)
- [LSP Configuration](#lsp-configuration)
- [Treesitter Setup](#treesitter-setup)
- [Keymaps & Which-Key](#keymaps--which-key)
- [Best Practices](#best-practices)

## Core Neovim Lua API

```lua
-- Options
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.expandtab = true
vim.opt.shiftwidth = 2

-- Keymaps
vim.keymap.set('n', '<leader>ff', '<cmd>Telescope find_files<cr>', { desc = 'Find files' })
vim.keymap.set('n', '<leader>w', '<cmd>w<cr>', { desc = 'Save', silent = true })

-- Autocommands
vim.api.nvim_create_autocmd('BufWritePre', {
  pattern = '*.lua',
  callback = function()
    vim.lsp.buf.format()
  end,
})

-- Augroup pattern
local group = vim.api.nvim_create_augroup('MyGroup', { clear = true })
vim.api.nvim_create_autocmd('FileType', {
  group = group,
  pattern = 'lua',
  callback = function() vim.opt_local.shiftwidth = 2 end,
})
```

## Plugin Management (lazy.nvim)

```lua
-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath('data') .. '/lazy/lazy.nvim'
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({ 'git', 'clone', '--filter=blob:none',
    'https://github.com/folke/lazy.nvim.git', lazypath })
end
vim.opt.rtp:prepend(lazypath)

-- Plugin spec
require('lazy').setup({
  { 'nvim-treesitter/nvim-treesitter', build = ':TSUpdate' },
  {
    'nvim-telescope/telescope.nvim',
    dependencies = { 'nvim-lua/plenary.nvim' },
    cmd = 'Telescope',  -- lazy load on command
    keys = {            -- lazy load on keymap
      { '<leader>ff', '<cmd>Telescope find_files<cr>', desc = 'Find files' },
    },
  },
})
```

## LSP Configuration

```lua
-- nvim-lspconfig pattern
local lspconfig = require('lspconfig')

lspconfig.lua_ls.setup({
  settings = {
    Lua = {
      diagnostics = { globals = { 'vim' } },
      workspace = { library = vim.api.nvim_get_runtime_file('', true) },
    },
  },
})

lspconfig.ts_ls.setup({
  on_attach = function(client, bufnr)
    -- Disable formatting if using null-ls/conform
    client.server_capabilities.documentFormattingProvider = false
  end,
})

-- Global keymaps for LSP
vim.keymap.set('n', 'gd', vim.lsp.buf.definition)
vim.keymap.set('n', 'K', vim.lsp.buf.hover)
vim.keymap.set('n', '<leader>rn', vim.lsp.buf.rename)
```

## Treesitter Setup

```lua
require('nvim-treesitter.configs').setup({
  ensure_installed = { 'lua', 'typescript', 'tsx', 'javascript' },
  highlight = { enable = true },
  indent = { enable = true },
  incremental_selection = {
    enable = true,
    keymaps = {
      init_selection = '<CR>',
      node_incremental = '<CR>',
      node_decremental = '<BS>',
    },
  },
})
```

## Keymaps & Which-Key

```lua
-- which-key integration
require('which-key').register({
  ['<leader>f'] = { name = '+find' },
  ['<leader>g'] = { name = '+git' },
})

-- Keymap with conditional logic
vim.keymap.set('n', '<leader>e', function()
  if vim.bo.filetype == 'NvimTree' then
    vim.cmd('NvimTreeClose')
  else
    vim.cmd('NvimTreeFocus')
  end
end, { desc = 'Toggle explorer' })
```

## Best Practices

- Use lazy.nvim with lazy loading (`cmd`, `keys`, `event`, `ft`)
- Prefer Lua over VimScript for Neovim configs
- Use `desc` in keymaps for which-key integration
- Organize config into modules (`lua/config/`, `lua/plugins/`)
- Use `vim.schedule` for deferred execution
- Use `pcall` for safe requires: `local ok, mod = pcall(require, 'module')`
- Prefer `vim.keymap.set` over `vim.api.nvim_set_keymap`
