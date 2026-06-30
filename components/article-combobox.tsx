"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Package, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Article } from "@/lib/types"

interface ArticleComboboxProps {
  articles: Article[]
  selectedId: string | null
  onSelect: (article: Article) => void
  loading?: boolean
  disabled?: boolean
}

function ArticleCombobox({ articles, selectedId, onSelect, loading = false, disabled = false }: ArticleComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = articles.find((a) => a.articleId === selectedId) ?? null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="glass"
          role="combobox"
          aria-expanded={open}
          aria-label="Select article"
          disabled={loading || disabled}
          className="h-12 w-full justify-between rounded-2xl px-4 text-left font-normal"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <Package className="size-4 shrink-0 text-accent" />
            {selected ? (
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{selected.name}</span>
                <span className="truncate text-xs text-muted-foreground">{selected.sku}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{loading ? "Loading articles…" : "Select article"}</span>
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command
          filter={(value, search) => {
            return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }}
        >
          <CommandInput placeholder="Search by name or SKU…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {articles.map((article) => (
                <CommandItem
                  key={article.articleId}
                  value={`${article.name} ${article.sku} ${article.category}`}
                  onSelect={() => {
                    onSelect(article)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("size-4 text-accent", selectedId === article.articleId ? "opacity-100" : "opacity-0")}
                  />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{article.name}</span>
                    <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <Tag className="size-3" />
                      {article.sku} · {article.category}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export default ArticleCombobox
