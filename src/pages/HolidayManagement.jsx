import React, { useState, useEffect } from 'react';
import { 
  Box, Button, Container, TextField, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel, Grid, Chip, IconButton, Tooltip 
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TableViewIcon from '@mui/icons-material/TableView';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const HOLIDAY_TYPES = {
  NATIONAL: { label: 'National Holiday', color: '#f44336' },
  RELIGIOUS: { label: 'Religious Holiday', color: '#4caf50' },
  COMPANY: { label: 'Company Holiday', color: '#2196f3' },
  OTHER: { label: 'Other', color: '#9e9e9e' },
  WEEKLY: { label: 'Weekly Holiday', color: '#9e9e9e' }
};

const HolidayManagement = () => {
  const [holidays, setHolidays] = useState([]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState('table'); // 'table' or 'calendar'
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [newHoliday, setNewHoliday] = useState({
    date: null,
    name: '',
    description: '',
    type: 'NATIONAL',
    isRecurring: false
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`http://localhost:8000/holidays/?year=${currentYear}`);
      const data = await response.json();
      setHolidays(data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewHoliday({
      date: null,
      name: '',
      description: '',
      type: 'NATIONAL',
      isRecurring: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if selected date is a Sunday
    if (newHoliday.date.getDay() === 0) {
      alert('Cannot add holiday on Sunday as it is already a default holiday');
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/holidays/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: format(newHoliday.date, 'yyyy-MM-dd'),
          name: newHoliday.name,
          description: newHoliday.description || '',
          type: newHoliday.type,
          is_recurring: newHoliday.isRecurring
        }),
      });

      if (response.ok) {
        handleClose();
        fetchHolidays();
      } else {
        const error = await response.json();
        console.error('Server error:', error);
        alert(error.detail);
      }
    } catch (error) {
      console.error('Error adding holiday:', error);
      alert('Failed to add holiday. Please try again.');
    }
  };

  const handleDelete = async (holidayId) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        const response = await fetch(`http://localhost:8000/holidays/${holidayId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchHolidays();
        }
      } catch (error) {
        console.error('Error deleting holiday:', error);
      }
    }
  };

  const renderCalendarView = () => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    return (
      <Grid container spacing={2}>
        {days.map((day) => {
          const holiday = holidays.find(h => isSameDay(new Date(h.date), day));
          return (
            <Grid item xs={1.7} key={day.toString()}>
              <Paper
                elevation={holiday ? 3 : 1}
                sx={{
                  p: 1,
                  height: '100px',
                  backgroundColor: holiday ? HOLIDAY_TYPES[holiday.type]?.color + '20' : 'white',
                  border: holiday ? `2px solid ${HOLIDAY_TYPES[holiday.type]?.color}` : '1px solid #eee',
                  position: 'relative'
                }}
              >
                <Typography variant="caption" color="textSecondary">
                  {format(day, 'd')}
                </Typography>
                {holiday && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" sx={{ color: HOLIDAY_TYPES[holiday.type]?.color }}>
                      {holiday.name}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Holiday Management
        </Typography>
        <Box>
          <IconButton onClick={() => setView('table')} color={view === 'table' ? 'primary' : 'default'}>
            <TableViewIcon />
          </IconButton>
          <IconButton onClick={() => setView('calendar')} color={view === 'calendar' ? 'primary' : 'default'}>
            <CalendarMonthIcon />
          </IconButton>
          <Button 
            variant="contained" 
            onClick={handleOpen} 
            sx={{ ml: 2, backgroundColor: '#023C5D' }}
          >
            Add Holiday
          </Button>
        </Box>
      </Box>

      {view === 'table' ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Recurring</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holidays.map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell>{format(new Date(holiday.date), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{holiday.name}</TableCell>
                  <TableCell>
                    <Chip label={HOLIDAY_TYPES[holiday.type]?.label || holiday.type} style={{ backgroundColor: HOLIDAY_TYPES[holiday.type]?.color, color: '#fff' }} />
                  </TableCell>
                  <TableCell>{holiday.description}</TableCell>
                  <TableCell>{holiday.is_recurring ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(holiday.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={["year", "month"]}
              label="Select Month"
              value={selectedMonth}
              onChange={(newValue) => setSelectedMonth(newValue)}
              renderInput={(params) => <TextField {...params} helperText={null} />}
            />
          </LocalizationProvider>
          <Box sx={{ mt: 3 }}>{renderCalendarView()}</Box>
        </Box>
      )}

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add New Holiday</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={newHoliday.date}
                onChange={(date) => setNewHoliday((prev) => ({ ...prev, date }))}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
              />
            </LocalizationProvider>
            <TextField
              label="Name"
              value={newHoliday.name}
              onChange={(e) => setNewHoliday((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              value={newHoliday.description}
              onChange={(e) => setNewHoliday((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Type</InputLabel>
              <Select
                value={newHoliday.type}
                label="Type"
                onChange={(e) => setNewHoliday((prev) => ({ ...prev, type: e.target.value }))}
              >
                {Object.entries(HOLIDAY_TYPES).map(([key, value]) => (
                  <MenuItem key={key} value={key}>{value.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Recurring</InputLabel>
              <Select
                value={newHoliday.isRecurring ? 'yes' : 'no'}
                label="Recurring"
                onChange={(e) => setNewHoliday((prev) => ({ ...prev, isRecurring: e.target.value === 'yes' }))}
              >
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: '#023C5D' }}>Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default HolidayManagement; 