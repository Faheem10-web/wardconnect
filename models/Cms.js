import mongoose from 'mongoose';

const CmsSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'cms_settings',
    unique: true
  },
  heroTitleEn: {
    type: String,
    default: 'Building a Safer, Greener Connected Neighborhood'
  },
  heroTitleMl: {
    type: String,
    default: 'നമ്മുടെ വാർഡ് നമ്മുടെ ഉത്തരവാദിത്വം - സുരക്ഷിതവും ഹരിതാഭവുമായ അയൽപക്കം'
  },
  heroDescriptionEn: {
    type: String,
    default: 'WardConnect brings modern SaaS-level issue tracking to civic governance. File complaints, follow resolution milestones in real-time, and attend community events.'
  },
  heroDescriptionMl: {
    type: String,
    default: 'വാർഡ് കണക്ട് നിങ്ങളുടെ വാർഡിലെ പ്രശ്നങ്ങൾ വേഗത്തിൽ പരിഹരിക്കാൻ സഹായിക്കുന്നു. പരാതികൾ സമർപ്പിക്കുക, അവയുടെ പുരോഗതി തത്സമയം നിരീക്ഷിക്കുക.'
  },
  heroImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=800'
  },
  heroUploadedImage: {
    type: String,
    default: ''
  },
  heroBanners: {
    type: [{
      id: { type: String, required: true },
      titleEn: { type: String, default: '' },
      titleMl: { type: String, default: '' },
      descriptionEn: { type: String, default: '' },
      descriptionMl: { type: String, default: '' },
      image: { type: String, default: '' },
      uploadedImage: { type: String, default: '' },
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true }
    }],
    default: []
  },
  autoSlideDuration: {
    type: Number,
    default: 5
  },
  wardMemberPhoto: {
    type: String,
    default: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
  },
  wardMemberName: {
    type: String,
    default: 'Marcus Vance'
  },
  wardMemberRoleEn: {
    type: String,
    default: 'Ward Member, Ward 4 Representative'
  },
  wardMemberRoleMl: {
    type: String,
    default: 'വാർഡ് മെമ്പർ, നാലാം വാർഡ് പ്രതിനിധി'
  },
  wardMemberQuoteEn: {
    type: String,
    default: 'Welcome to WardConnect. We believe that communication is the foundation of civic trust. By offering this transparent intake platform, my committee is committed to resolving infrastructure problems and keeping our neighborhood safe, illuminated, and clean.'
  },
  wardMemberQuoteMl: {
    type: String,
    default: 'വാർഡ് കണക്ടിലേക്ക് സ്വാഗതം. പരസ്പരവിശ്വാസമാണ് ഭരണത്തിന്റെ അടിസ്ഥാനം. സുരക്ഷിതവും ശുചിത്വമുള്ളതുമായ ഒരു വാർഡ് നിർമ്മിക്കാൻ നിങ്ങളുടെ പിന്തുണ ഞങ്ങൾ പ്രതീക്ഷിക്കുന്നു.'
  },
  wardMemberPhone: {
    type: String,
    default: '(555) 019-9020'
  },
  wardMemberEmail: {
    type: String,
    default: 'vance@ward4.gov'
  },
  wardNumber: {
    type: Number,
    default: 4
  },
  locationNameEn: {
    type: String,
    default: 'Metro City'
  },
  locationNameMl: {
    type: String,
    default: 'മെട്രോ സിറ്റി'
  },
  officeAddressEn: {
    type: String,
    default: '123 Municipal Road, Ward 4, Metro City'
  },
  officeAddressMl: {
    type: String,
    default: '123 മുനിസിപ്പൽ റോഡ്, നാലാം വാർഡ്, മെട്രോ സിറ്റി'
  },
  officePhone: {
    type: String,
    default: '+1 (555) 019-2834'
  },
  officeEmail: {
    type: String,
    default: 'support@wardconnect.gov'
  }
});

export default mongoose.models.Cms || mongoose.model('Cms', CmsSchema);
