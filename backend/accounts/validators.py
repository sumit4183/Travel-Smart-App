import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class CustomPasswordValidator:
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError(_("Password must contain at least one uppercase letter."))
        if not re.findall('[0-9]', password):
            raise ValidationError(_("Password must contain at least one number."))
        if not re.findall('[^A-Za-z0-9]', password):
            raise ValidationError(_("Password must contain at least one special character."))

    def get_help_text(self):
        return _("Your password must contain at least one uppercase letter, one number, and one special character.")
