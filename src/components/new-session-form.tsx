'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createSession, sessionFormSchema } from '@/app/actions/sessions'
import { useToast } from '@/components/ui/use-toast'
import { SubmitButton } from './submit-button'
import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, UploadCloud } from 'lucide-react'
import { format } from 'date-fns'

const extendedSessionFormSchema = sessionFormSchema.extend({
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
})

export function NewSessionForm({ closeDialog }: { closeDialog?: () => void }) {
  const { toast } = useToast()
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>()
  const [imageFiles, setImageFiles] = useState<FileList | null>(null)

  const form = useForm({
    resolver: zodResolver(extendedSessionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 30,
      price: 100,
      deposit: 0,
      depositRequired: false,
      locationName: '',
      address: '',
      locationNotes: '',
      startTime: '09:00',
      endTime: '17:00',
    },
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFiles(event.target.files)
    }
  }

  async function onSubmit(values: any) {
    if (!selectedDates || selectedDates.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one date for the session.",
        variant: "destructive",
      })
      return
    }

    const payload = {
      ...values,
      deposit: values.deposit ? Number(values.deposit) : undefined,
      selectedDates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
    }
    console.log("Submitting Payload:", payload)

    const result = { error: 'createSession needs update' }

    if (result.error) {
      toast({
        title: 'Error creating session',
        description: result.error,
        variant: 'destructive',
      })
    } else {
      toast({
        title: 'Session Created (Placeholder)',
        description: `Session "${values.name}" structure ready.`,
      })
      form.reset()
      setSelectedDates(undefined)
      setImageFiles(null)
      const fileInput = document.getElementById('session-images') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      closeDialog?.()
    }
  }

  return (
    <Card className="max-h-[90vh] overflow-y-auto">
      <CardHeader>
        <CardTitle>Create New Session</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Spring Mini Sessions" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add details about the session..."
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="15" {...field} value={field.value ?? ''} />
                    </FormControl>
                     <FormDescription>
                      How long is each bookable time slot?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($) *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="100.00" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-end">
              <FormField
                control={form.control}
                name="deposit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposit ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="50.00" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>
                      Optional retainer amount.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="depositRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 mb-1">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Require Deposit to Book?
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Central Park" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St, Anytown, USA" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="locationNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Meet near the fountain"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Session Dates *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${
                        !selectedDates && "text-muted-foreground"
                      }`}
                    >
                      {selectedDates && selectedDates.length > 0
                        ? selectedDates.map(date => format(date, "PPP")).join(", ")
                        : "Pick date(s)"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={setSelectedDates}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select one or more dates when this session will be held.
              </FormDescription>
            </FormItem>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Start Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormDescription>Start time for all selected dates.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily End Time *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                       <FormDescription>End time for all selected dates.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormItem>
                <FormLabel>Promotional Images</FormLabel>
                <FormControl>
                    <div className="flex items-center justify-center w-full">
                         <label htmlFor="session-images" className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                 <UploadCloud className="w-8 h-8 mb-4 text-muted-foreground" />
                                 <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                 <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                 {imageFiles && <p className="mt-2 text-xs text-foreground">{imageFiles.length} file(s) selected</p>}
                             </div>
                             <Input id="session-images" name="session_images" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/*" />
                         </label>
                     </div> 
                </FormControl>
                <FormDescription>
                    Upload images to display on the public booking page gallery.
                </FormDescription>
                <FormMessage />
            </FormItem>

            <div className="flex justify-end space-x-2 pt-4">
                {closeDialog && (
                    <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                )}
                <SubmitButton>Create Session</SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 