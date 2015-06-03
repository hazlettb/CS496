# Barbara Hazlett
# CS496 Final Project
# Web interface for Time Card native app
import webapp2
import base_page
from google.appengine.ext import ndb
import db_defs
from datetime import datetime, timedelta

class Entry(base_page.BaseHandler):
	def __init__(self, request, response):
		self.initialize(request, response)
		self.template_values = {}			
		
	def get(self):
		self.render('clockin_out.html')

#to add data via the cloud application		
	def post(self):
		action = self.request.get('action')
		if action == 'add_clock':
			clock = datetime.utcnow()
			k = ndb.Key(db_defs.TimeClock, self.app.config.get('default-group'))
			ent = db_defs.TimeClock(parent=k)
			ent.id = self.request.get('entry-id')
			ent.month = clock.strftime('%m')			
			ent.day = clock.strftime('%d')
			ent.year = clock.strftime('%Y')
			ent.hour = clock.strftime('%I') 
			ent.minute = clock.strftime('%M')
			ent.second = clock.strftime('%S')
			choice = self.request.get('choice')
			if choice == 'choice-1':				
				ent.in_out = 'IN'			
			else:
				ent.in_out = 'OUT'
			ent.put()			
		self.render('clockin_out.html')	

#to add data via the native application		
class TiData(base_page.BaseHandler):
	def post(self):
		k = ndb.Key(db_defs.TimeClock, self.app.config.get('default-group'))
		ent = db_defs.TimeClock(parent=k)
		ent.id = self.request.get('id')
		ent.month = self.request.get('month')
		ent.day = self.request.get('day')
		ent.year = self.request.get('year')
		ent.hour = self.request.get('hour')
		ent.minute = self.request.get('minute')
		ent.second = self.request.get('second')
		ent.in_out = self.request.get('in_out')			
		ent.put()
		
	def get(self):
		self.response.headers['Content-Type'] = 'text/plain'
		self.response.write('Ti Upload')
	
#to display data - all or by employee number
class Display(base_page.BaseHandler):
	def __init__(self, request, response):
		self.initialize(request, response)
		self.template_values = {}
		
	def render(self, page):
		action = self.request.get('action')
		choice = self.request.get('choice')
		if action == 'view_emp':		
			self.template_values['entries'] = [{'id':x.id, 'day': x.day, 'month': x.month, 'year': x.year, 'hour': x.hour, 'minute': x.minute,'second': x.second,'in_out': x.in_out, 'key':x.key.urlsafe()} for x in db_defs.TimeClock.query(ancestor=ndb.Key(db_defs.TimeClock, self.app.config.get('default-group'))).fetch() if x.id == choice]
		else:
			self.template_values['entries'] = [{'id':x.id, 'day': x.day, 'month': x.month, 'year': x.year, 'hour': x.hour, 'minute': x.minute, 'second':x.second,'in_out': x.in_out, 'key':x.key.urlsafe()} for x in db_defs.TimeClock.query(ancestor=ndb.Key(db_defs.TimeClock, self.app.config.get('default-group'))).fetch()]
		base_page.BaseHandler.render(self, page, self.template_values)

	def get(self):
		self.render('display.html')	
		
#cron job to periodically delete in/out data
class CleanUp(base_page.BaseHandler):
	def get(self):
		c_clock = datetime.utcnow()
		c_month = c_clock.strftime('%m')
		entries = db_defs.TimeClock.query(ancestor=ndb.Key(db_defs.TimeClock, self.app.config.get('default-group'))).fetch()
		for en in entries:	
			if en.month != c_month: 
				en.key.delete() 
		self.response.write("deleted old entries")		