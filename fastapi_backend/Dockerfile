FROM public.ecr.aws/lambda/python:3.11

# Create necessary directories with appropriate permissions
RUN mkdir -p /tmp/.u2net
RUN mkdir -p /tmp/rembg/sessions
RUN chmod 777 /tmp/.u2net
RUN chmod 777 /tmp/rembg/sessions

# Copy function code and model
COPY . ${LAMBDA_TASK_ROOT}
COPY ./u2net.onnx /tmp/rembg/sessions/u2net.onnx

# Set environment variables
ENV U2NET_HOME=/tmp/.u2net
ENV REMBG_MODEL_PATH=/tmp/rembg/sessions/u2net.onnx
ENV TRANSFORMERS_CACHE=/tmp/transformers
ENV TORCH_HOME=/tmp/torch

# Install the function's dependencies
COPY requirements.txt .
RUN pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}" --no-cache-dir

# Set the CMD to your handler
CMD [ "main.handler" ]