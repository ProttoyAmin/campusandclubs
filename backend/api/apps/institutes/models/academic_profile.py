from django.db import models

class AcademicProfile(models.Model):
    member = models.OneToOneField(
        'institutes.InstituteAffiliate', on_delete=models.CASCADE, related_name='academic_profile'
    )
    academic_email = models.EmailField(unique=True, null=True, blank=True)
    student_id = models.CharField(max_length=50, blank=True)
    semester = models.PositiveSmallIntegerField(blank=True, null=True)
    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
    )

    batch = models.PositiveIntegerField(
        blank=True,
        null=True
    )

    department = models.ForeignKey('institutes.Department', on_delete=models.CASCADE, related_name='department')

    employee_id = models.CharField(
        max_length=50,
        blank=True,
    )

    designation = models.CharField(
        max_length=100,
        blank=True,
    )

    joined_institute_at = models.DateField(
        null=True,
        blank=True,
    )

    graduation_year = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'academic_profiles'
        verbose_name = 'Academic Profile'
        verbose_name_plural = 'Academic Profiles'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['member'],
                name='unique_academic_profile',
            )
        ]
        indexes = [
            models.Index(fields=['member']),
            models.Index(fields=['academic_email']),
            models.Index(fields=['department']),
            models.Index(fields=['student_id']),
        ]
        unique_together = [
            ('member', 'academic_email'),
        ]

    def __str__(self) -> str:
        return self.member.username
