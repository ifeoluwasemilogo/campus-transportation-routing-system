from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import StudentRegistrationSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def register_student(request):
    serializer = StudentRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(
        {
            'detail': 'Student account created. You can now sign in.',
            'user': {
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': user.role.lower(),
            },
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    if not isinstance(request.data, dict):
        return Response(
            {'detail': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = request.data.get('email')
    password = request.data.get('password')

    if (
        not isinstance(email, str)
        or not email.strip()
        or not isinstance(password, str)
        or not password
    ):
        return Response(
            {'detail': 'Email and password are required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = email.strip().lower()
    user = authenticate(request, username=email, password=password)
    if user is None or not user.is_active:
        return Response(
            {'detail': 'Invalid credentials.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    refresh = RefreshToken.for_user(user)
    return Response(
        {
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.get_full_name() or user.username,
                'role': user.role.lower(),
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def logout(request):
    if not isinstance(request.data, dict):
        return Response(
            {'detail': 'A refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    refresh_token_value = request.data.get('refresh')
    if not isinstance(refresh_token_value, str) or not refresh_token_value:
        return Response(
            {'detail': 'A refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        RefreshToken(refresh_token_value).blacklist()
    except TokenError:
        return Response(
            {'detail': 'The refresh token is invalid or has already expired.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    return Response(
        {'detail': 'Signed out.'},
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh_token_value = (
        request.data.get('refresh')
        if isinstance(request.data, dict)
        else None
    )
    if not isinstance(refresh_token_value, str) or not refresh_token_value:
        return Response(
            {
                'detail': (
                    'A refresh token is required. Access tokens cannot be '
                    'used to refresh a session.'
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        refresh = RefreshToken(refresh_token_value)
    except TokenError:
        return Response(
            {
                'detail': (
                    'The refresh token is expired, revoked, or invalid. '
                    'Sign in again with a fresh session.'
                )
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response({'access': str(refresh.access_token)}, status=status.HTTP_200_OK)
