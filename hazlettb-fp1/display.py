import webapp2
import base_page
from google.appengine.ext import ndb
from google.appengine.ext import blobstore
import db_defs

class Contact(base_page.BaseHandler):
	def __init__(self, request, response):
		self.initialize(request, response)
		self.template_values = {}
		self.template_values['upload_url'] = blobstore.create_upload_url('/contact/add')	

	def get(self):
		self.render('contact.html')
		
	def post(self, photo_key=None):
		action = self.request.get('action')
		if action == 'add_contact':
			k = ndb.Key(db_defs.Contact, self.app.config.get('default-group'))
			con = db_defs.Contact(parent=k)
			con.photo=photo_key
			con.name = self.request.get('contact-name')
			con.pnum = self.request.get('contact-pnum')
			con.email = self.request.get('contact-email')
			con.address = self.request.get('contact-address')
			con.active = True
			con.put()
			self.template_values['message'] = 'Added ' + con.name + ' to the contact list.'
		else:
			self.template_values['message'] = 'Action ' + con.name + ' is unknown.'
		self.render('contact.html')	