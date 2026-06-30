"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, Store as StoreIcon, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { Store } from "@/lib/types"

interface StoreComboboxProps {
  stores: Store[]
  selectedId: string | null
  onSelect: (store: Store) => void
  loading?: boolean
}

function StoreCombobox({ stores, selectedId, onSelect, loading = false }: StoreComboboxProps) {
  const [open, setOpen] = useState(false)
  const selected = stores.find((s) => s._id === selectedId) ?? null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="glass"
          role="combobox"
          aria-expanded={open}
          aria-label="Select store"
          disabled={loading}
          className="h-12 w-full justify-between rounded-2xl px-4 text-left font-normal"
        >
          <span className="flex min-w-0 items-center gap-2.5">
            <StoreIcon className="size-4 shrink-0 text-accent" />
            {selected ? (
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{selected.name}</span>
                <span className="truncate text-xs text-muted-foreground">{selected.contactInformation.city}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">{loading ? "Loading stores…" : "Select store"}</span>
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
          <CommandInput placeholder="Search by store or city…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {stores.map((store) => (
                <CommandItem
                  key={store._id}
                  value={`${store.name} ${store.contactInformation.city} ${store.contactInformation.country} ${store.externalRef}`}
                  onSelect={() => {
                    onSelect(store)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("size-4 text-accent", selectedId === store._id ? "opacity-100" : "opacity-0")} />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{store.name}</span>
                    <span className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {store.contactInformation.city}, {store.contactInformation.country}
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

export default StoreCombobox
