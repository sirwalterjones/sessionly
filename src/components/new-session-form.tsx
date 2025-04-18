'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type SubmitHandler } from 'react-hook-form'
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
import { createSession } from '@/app/actions/sessions'
import { sessionFormSchema } from '@/lib/schemas'
import type { SessionFormData, SessionWithDatesFormData } from '@/lib/schemas'
import { useToast } from '@/components/ui/use-toast'
import { SubmitButton } from './submit-button'
import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MinusCircle, PlusCircle, UploadCloud } from 'lucide-react'
import { format } from 'date-fns'
import { uploadSessionImages, createSessionImageRecord } from '@/lib/storage-utils'

// Infer the schema type for the form
// No need to export this if only used here
// type FormData = z.infer<typeof sessionFormSchema>

export function NewSessionForm({ closeDialog }: { closeDialog?: () => void }) {
  const { toast } = useToast()
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>()
  const [imageFiles, setImageFiles] = useState<FileList | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm({
    resolver: zodResolver(sessionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      duration: 30,
      price: 100,
      deposit: undefined,
      depositRequired: false,
      locationName: '',
      address: '',
      locationNotes: '',
      startTime: '09:00',
      endTime: '17:00',
      numberOfSpots: 1,
      gapBetweenSlots: 0,
      sameStartTime: false
    },
    mode: 'onBlur'
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setImageFiles(event.target.files)
    }
  }

  async function handleImageUploads(sessionId: string) {
    if (!imageFiles || imageFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      const files = Array.from(imageFiles);
      const { uploads, errorCount } = await uploadSessionImages(files, sessionId);
      
      await Promise.all(uploads.map(upload => 
        upload.path && upload.url ? createSessionImageRecord(sessionId, upload.path, upload.url) : Promise.resolve()
      ));
      
      if (errorCount > 0) {
        toast({
          title: 'Image Upload Status',
          description: `${uploads.length - errorCount}/${uploads.length} images uploaded successfully.`,
          variant: errorCount === uploads.length ? 'destructive' : 'default',
        });
      } else {
        toast({
          title: 'Images Uploaded',
          description: `All ${uploads.length} images uploaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Image Upload Error',
        description: 'Some images failed to upload. Try uploading them later from the session details page.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }

  const onSubmit: SubmitHandler<z.infer<typeof sessionFormSchema>> = async (values) => {
    if (!selectedDates || selectedDates.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one date for the session.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const formattedDates = selectedDates.map(date => format(date, 'yyyy-MM-dd'))
      
      const payload: SessionWithDatesFormData = {
        ...values,
        deposit: values.deposit ? Number(values.deposit) : undefined,
        selectedDates: formattedDates,
      }
      
      const result = await createSession(payload)

      if (result.error) {
        toast({
          title: 'Error creating session',
          description: result.error,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Success',
          description: `Session "${values.name}" has been created.`,
        })
        
        if (imageFiles && imageFiles.length > 0) {
          await handleImageUploads(result.data.id)
        }
        
        form.reset()
        setSelectedDates(undefined)
        setImageFiles(null)
        
        const fileInput = document.getElementById('session-images') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        
        closeDialog?.()
      }
    } catch (error) {
      console.error('Session creation error:', error)
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during session creation. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getSubmitText = () => {
    if (isUploading) return 'Uploading Images...';
    if (isSubmitting) return 'Creating...';
    return 'Create Session';
  };

  const isDisabled = isSubmitting || isUploading;

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
                      <Input 
                        type="number" 
                        placeholder="15" 
                        {...field} 
                        onChange={(e) => field.onChange(+e.target.value)} 
                        value={field.value ?? ''} 
                      />
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
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="100.00" 
                        {...field} 
                        onChange={(e) => field.onChange(+e.target.value)} 
                        value={field.value ?? ''} 
                      />
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
                       <Input 
                         type="number" 
                         step="0.01" 
                         placeholder="50.00" 
                         {...field} 
                         onChange={(e) => field.onChange(e.target.value === '' ? undefined : +e.target.value)}
                         value={field.value ?? ''} 
                       />
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
                name="numberOfSpots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Spots</FormLabel>
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => field.onChange(Math.max(1, (field.value ?? 1) - 1))}
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min={1}
                          className="w-20 text-center"
                          onChange={(e) => field.onChange(+e.target.value)}
                          value={field.value ?? ''} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => field.onChange((field.value ?? 0) + 1)}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gapBetweenSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gap Between Slots (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) => field.onChange(+e.target.value)}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Time between consecutive slots
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sameStartTime"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Set the same start time for all spots
                    </FormLabel>
                    <FormDescription>
                      Great for classes, workshops, and group events.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

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
                                 <p className="text-xs text-muted-foreground">Max 5 images (PNG, JPG, GIF, WEBP)</p>
                                 {imageFiles && <p className="mt-2 text-xs text-foreground">{imageFiles.length} file(s) selected</p>}
                             </div>
                             <Input id="session-images" name="session_images" type="file" className="hidden" multiple onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
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
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={closeDialog} 
                      disabled={isDisabled}
                    >
                      Cancel
                    </Button>
                )}
                <SubmitButton disabled={isDisabled}>
                  {getSubmitText()}
                </SubmitButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 