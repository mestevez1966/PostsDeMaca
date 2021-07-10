# install.packages("rtweet")

library(rtweet)

# Keys
api_key <- "9myBYlfr9KVKAYXaJCf1V8h9G"
api_secret_key <- "upasA4Ma7fRKfEedLT5xyoTjBaCHrRvawVnsaFLFZavnIW48Wl"
access_token <- "119477518-mA6zS2McTlxuNQDD1fLGbAO4nZ8ZTJtZuzvL6uJ9"
access_token_secret <- "sR1kK3ToPkTZ2pnt31eyE4HayLLp0ZDgi5bItq0dXemCm"

# Authenticate via web browser
token <- create_token(
  app = "PostsMaca",
  consumer_key = api_key,
  consumer_secret = api_secret_key,
  access_token = access_token,
  access_secret = access_token_secret)


get_token()

# 10 last tweets
tweets <- get_timelines("macarenaEstevez", n = 10)
View(tweets)


# Start date
start <- Sys.Date() - 1

tweets$created_at <- as.Date(tweets$created_at, format= "%Y-%m-%d")
tweets <- subset(tweets, tweets$created_at == start)


#-------------------------------
# Download images
#-------------------------------


# Error handling
w <- 1
err <- numeric()

j <- 2

for(i in 1:nrow(tweets)){

  if(file.exists(paste0(tweets$created_at[i], ".png"))) {
    img_name <- paste0(i, "_" , tweets$created_at[i], "_", j , ".png")
    j <- j + 1

  } else {
    img_name <- paste0(i, "_" , tweets$created_at[i], ".png")
    j <- 2
  }

  print(i)

  tryCatch(download.file(tweets$media_url[i], img_name),
           error = function(e) {
             w <- w + 1
             paste("Error en ", i)
             err[w] <- i
             })
 }




#-------------------------------
# Create files
#-------------------------------             

setwd("/home/josecarlos/Escritorio/PostsDeMaca/content/posts/2021")

j <- 1

for(i in 1:nrow(tweets)){
  
  
  if(file.exists(paste0(tweets$created_at[i], ".md"))) {
    file_name <- paste0(tweets$created_at[i], "_", j , ".md")
    j <- j + 1
    
  } else {
    file_name <- paste0(tweets$created_at[i], ".md")
    j <- 2
  }
  
  
  
  
  
  sink(file = file_name)
  
  cat("---", "\n")
  cat("category:", tweets$category[i], "\n")
  cat(paste("date:", tweets$created_at[i]), "\n")
  cat(paste0("image: /", tweets$image[i]), "\n")
  cat("---", "\n")
  cat(sep = "\n")
  cat(tweets$text[i])
  
  sink()
}








