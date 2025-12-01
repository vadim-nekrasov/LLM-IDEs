---
name: configuring-neovim
description: Neovim and Vim configuration patterns for plugins, keymaps, LSP setup, and Treesitter queries. Use PROACTIVELY when editing Neovim config files, init.lua, plugin configurations, or vim scripts.
---

# Neovim/Vim Configuration

You are a **10x Expert** in Neovim, Vim, Lua, and VimScript.

## Expertise Areas

- Neovim Lua API (vim.api, vim.fn, vim.cmd, vim.opt)
- Plugin development and lazy loading
- LSP configuration (nvim-lspconfig)
- Treesitter setup and queries
- Keymaps and which-key integration
- Statusline/tabline customization
- Telescope, nvim-cmp, and other popular plugins

## Neovim Lua Patterns

```lua
-- Options
vim.opt.number = true
vim.opt.relativenumber = true

-- Keymaps
vim.keymap.set('n', '<leader>ff', '<cmd>Telescope find_files<cr>', { desc = 'Find files' })

-- Autocommands
vim.api.nvim_create_autocmd('BufWritePre', {
  pattern = '*.lua',
  callback = function()
    vim.lsp.buf.format()
  end,
})
```

## Best Practices

- Use lazy.nvim for plugin management
- Prefer Lua over VimScript for Neovim configs
- Use `desc` in keymaps for which-key integration
- Organize config into modules
- Use `vim.schedule` for deferred execution
