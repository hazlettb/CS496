from google.appengine.ext import ndb

#this class is not in use (yet)
class Employee(ndb.Model):
	name = ndb.StringProperty(required=True)
	id = ndb.IntegerProperty(required=True)
	active = ndb.BooleanProperty(required=True)
	photo = ndb.BlobKeyProperty()
		
class TimeClock(ndb.Model):
	id = ndb.StringProperty(required=True)
	day = ndb.StringProperty(required=True)
	month = ndb.StringProperty(required=True)
	year = ndb.StringProperty(required=True)
	hour = ndb.StringProperty(required=True)
	minute = ndb.StringProperty(required=True)
	second = ndb.StringProperty(required=True)
	in_out = ndb.StringProperty(required=True)	
	